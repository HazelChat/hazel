import * as crypto from "node:crypto"
import { Config, Effect, Schema } from "effect"

// Error types
export class WebhookVerificationError extends Schema.TaggedError<WebhookVerificationError>(
	"WebhookVerificationError",
)("WebhookVerificationError", {
	message: Schema.String,
}) {}

export class WebhookTimestampError extends Schema.TaggedError<WebhookTimestampError>("WebhookTimestampError")(
	"WebhookTimestampError",
	{
		message: Schema.String,
		timestamp: Schema.Number,
		currentTime: Schema.Number,
	},
) {}

export interface WorkOSWebhookSignature {
	timestamp: number
	signature: string
}

export class WorkOSWebhookVerifier extends Effect.Service<WorkOSWebhookVerifier>()("WorkOSWebhookVerifier", {
	accessors: true,
	effect: Effect.gen(function* () {
		// Get webhook secret from config
		const webhookSecret = yield* Config.string("WORKOS_WEBHOOK_SECRET")

		/**
		 * Parse the WorkOS-Signature header
		 * Format: "t=<timestamp>,v1=<signature>"
		 */
		const parseSignatureHeader = (
			header: string,
		): Effect.Effect<WorkOSWebhookSignature, WebhookVerificationError> =>
			Effect.gen(function* () {
				const parts = header.split(",").map((p) => p.trim())
				if (parts.length !== 2) {
					return yield* Effect.fail(
						new WebhookVerificationError({
							message: `Invalid signature header format: expected 2 parts (t=...,v1=...), got ${parts.length}. Header: '${header.slice(0, 50)}${header.length > 50 ? "..." : ""}'`,
						}),
					)
				}

				const timestampPart = parts[0]
				const signaturePart = parts[1]

				if (!timestampPart.startsWith("t=") || !signaturePart.startsWith("v1=")) {
					return yield* Effect.fail(
						new WebhookVerificationError({
							message: `Invalid signature header format: expected 't=<timestamp>,v1=<signature>', got '${timestampPart.slice(0, 15)}...,${signaturePart.slice(0, 15)}...'`,
						}),
					)
				}

				const timestamp = parseInt(timestampPart.slice(2), 10)
				const signature = signaturePart.slice(3)

				if (Number.isNaN(timestamp)) {
					return yield* Effect.fail(
						new WebhookVerificationError({
							message: `Invalid timestamp in signature header: '${timestampPart}' is not a valid number`,
						}),
					)
				}

				return { timestamp, signature }
			})

		/**
		 * Validate timestamp to prevent replay attacks
		 * Default tolerance is 5 minutes (300 seconds)
		 */
		const validateTimestamp = (
			timestamp: number,
			toleranceSeconds = 300,
		): Effect.Effect<void, WebhookTimestampError> =>
			Effect.gen(function* () {
				const currentTime = Math.floor(Date.now() / 1000)
				const difference = Math.abs(currentTime - timestamp)

				if (difference > toleranceSeconds) {
					return yield* Effect.fail(
						new WebhookTimestampError({
							message: `Webhook timestamp is too old. Difference: ${difference}s, Tolerance: ${toleranceSeconds}s`,
							timestamp,
							currentTime,
						}),
					)
				}
			})

		/**
		 * Compute the expected signature using HMAC SHA256
		 */
		const computeSignature = (timestamp: number, payload: string): string => {
			const signedPayload = `${timestamp}.${payload}`
			const hmac = crypto.createHmac("sha256", webhookSecret)
			hmac.update(signedPayload)
			return hmac.digest("hex")
		}

		/**
		 * Verify the webhook signature
		 */
		const verifyWebhook = (
			signatureHeader: string,
			payload: string,
			options?: {
				timestampTolerance?: number
			},
		): Effect.Effect<void, WebhookVerificationError | WebhookTimestampError> =>
			Effect.gen(function* () {
				// Parse the signature header
				const { timestamp, signature } = yield* parseSignatureHeader(signatureHeader)

				// Validate timestamp
				yield* validateTimestamp(timestamp, options?.timestampTolerance)

				// Compute expected signature
				const expectedSignature = computeSignature(timestamp, payload)

				// Compare signatures using timing-safe comparison
				const signatureBuffer = Buffer.from(signature, "hex")
				const expectedBuffer = Buffer.from(expectedSignature, "hex")

				if (signatureBuffer.length !== expectedBuffer.length) {
					return yield* Effect.fail(
						new WebhookVerificationError({
							message: `Signature length mismatch: received ${signatureBuffer.length} bytes, expected ${expectedBuffer.length} bytes`,
						}),
					)
				}

				if (
					!crypto.timingSafeEqual(new Uint8Array(signatureBuffer), new Uint8Array(expectedBuffer))
				) {
					return yield* Effect.fail(
						new WebhookVerificationError({
							message:
								"Webhook signature does not match. This could indicate the webhook secret is incorrect or the payload was modified.",
						}),
					)
				}

				yield* Effect.logInfo("WorkOS webhook signature verified successfully")
			})

		return {
			verifyWebhook,
			parseSignatureHeader,
			validateTimestamp,
			computeSignature,
		}
	}),
}) {}
