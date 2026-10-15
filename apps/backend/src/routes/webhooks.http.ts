import { createHmac, timingSafeEqual } from "node:crypto"
import { HttpApiBuilder } from "effect/http-api"
import { HttpServerRequest } from "effect/http"
import {
	InternalServerError,
	WorkflowInitializationError,
	WorkflowServiceUnavailableError,
} from "@hazel/domain"
import {
	GitHubWebhookResponse,
	InvalidGitHubWebhookPayload,
	InvalidGitHubWebhookSignature,
} from "@hazel/domain/http"
import { Config, Effect, Option, pipe, Redacted, Schema } from "effect"
import { HazelApi } from "../api"
import { makeClusterClient } from "../lib/cluster-client"

/** Installation lifecycle actions the installation workflow handles; others are acknowledged and skipped. */
const InstallationAction = Schema.Literals(["created", "deleted", "suspend", "unsuspend"])

const InstallationEvent = Schema.Struct({
	action: InstallationAction,
	installation: Schema.Struct({
		id: Schema.Number,
		account: Schema.Struct({
			login: Schema.String,
			type: Schema.Literals(["User", "Organization"]),
		}),
	}),
	sender: Schema.optional(Schema.Struct({ login: Schema.String })),
})

/** The fields every repository event the webhook workflow handles carries. */
const RepositoryEvent = Schema.Struct({
	installation: Schema.Struct({ id: Schema.Number }),
	repository: Schema.Struct({ id: Schema.Number, full_name: Schema.String }),
})

const LoggedFields = Schema.Struct({
	action: Schema.optional(Schema.String),
	repository: Schema.optional(Schema.Struct({ full_name: Schema.optional(Schema.String) })),
})

const decodeJson = Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Unknown))
const decodeInstallationAction = Schema.decodeUnknownOption(Schema.Struct({ action: InstallationAction }))
const decodeInstallationEvent = Schema.decodeUnknownEffect(InstallationEvent)
const decodeRepositoryEvent = Schema.decodeUnknownOption(RepositoryEvent)
const decodeLoggedFields = Schema.decodeUnknownOption(LoggedFields)

export const HttpWebhookLive = HttpApiBuilder.group(HazelApi, "webhooks", (handlers) =>
	handlers.handle("github", (_args) =>
		Effect.gen(function* () {
			const request = yield* HttpServerRequest.HttpServerRequest

			const eventType = request.headers["x-github-event"]
			const signature = request.headers["x-hub-signature-256"]
			const deliveryId = request.headers["x-github-delivery"]

			if (!eventType || !deliveryId) {
				return yield* Effect.fail(
					new InvalidGitHubWebhookSignature({
						message: "Missing required GitHub webhook headers",
					}),
				)
			}

			const rawBody = yield* pipe(
				request.text,
				Effect.mapError(
					() =>
						new InvalidGitHubWebhookSignature({
							message: "Invalid request body",
						}),
				),
			)

			const skipSignatureVerification = yield* Config.Boolean("GITHUB_WEBHOOK_SKIP_SIGNATURE").pipe(
				Config.withDefault(false),
			)

			const webhookSecret = yield* Effect.gen(function* () {
				return yield* Config.Redacted("GITHUB_WEBHOOK_SECRET")
			}).pipe(
				Effect.catchTag("ConfigError", () =>
					skipSignatureVerification
						? Effect.succeed(Redacted.make(""))
						: Effect.fail(
								new InvalidGitHubWebhookSignature({
									message:
										"GITHUB_WEBHOOK_SECRET not configured. Set GITHUB_WEBHOOK_SKIP_SIGNATURE=true to disable in development.",
								}),
							),
				),
			)

			const secretValue = Redacted.value(webhookSecret)
			if (secretValue) {
				if (!signature) {
					yield* Effect.logWarning("Missing GitHub webhook signature header")
					return yield* Effect.fail(
						new InvalidGitHubWebhookSignature({
							message: "Missing x-hub-signature-256 header",
						}),
					)
				}

				const bodyHmac = createHmac("sha256", secretValue)
				bodyHmac.update(rawBody)
				const expectedSignature = `sha256=${bodyHmac.digest("hex")}`

				const signatureBuffer = Buffer.from(signature)
				const expectedBuffer = Buffer.from(expectedSignature)

				if (
					signatureBuffer.length !== expectedBuffer.length ||
					!timingSafeEqual(signatureBuffer, expectedBuffer)
				) {
					yield* Effect.logWarning("Invalid GitHub webhook signature", {
						eventType,
						deliveryId,
					})
					return yield* Effect.fail(
						new InvalidGitHubWebhookSignature({
							message: "Invalid webhook signature",
						}),
					)
				}
			}

			const payload = yield* decodeJson(rawBody).pipe(
				Effect.mapError(
					() => new InvalidGitHubWebhookPayload({ message: "Webhook body is not valid JSON" }),
				),
			)

			const logged = decodeLoggedFields(payload)
			yield* Effect.logInfo("Received GitHub webhook", {
				eventType,
				deliveryId,
				repository: Option.getOrUndefined(logged)?.repository?.full_name,
				action: Option.getOrUndefined(logged)?.action,
			})

			const clusterUrl = yield* Config.String("CLUSTER_URL")
			const client = yield* makeClusterClient(clusterUrl)

			if (eventType === "installation") {
				if (Option.isNone(decodeInstallationAction(payload))) {
					yield* Effect.logDebug("Skipping installation webhook - unsupported action", {
						deliveryId,
					})
					return new GitHubWebhookResponse({ processed: false, messagesCreated: 0 })
				}

				const event = yield* decodeInstallationEvent(payload).pipe(
					Effect.mapError(
						() =>
							new InvalidGitHubWebhookPayload({
								message: "Installation event is missing its installation or account",
							}),
					),
				)

				yield* client.workflows
					.GitHubInstallationWorkflow({
						payload: {
							deliveryId,
							action: event.action,
							installationId: event.installation.id,
							accountLogin: event.installation.account.login,
							accountType: event.installation.account.type,
							senderLogin: event.sender?.login ?? "unknown",
						},
					})
					.pipe(
						Effect.catchTags({
							HttpClientError: (cause) =>
								Effect.fail(
									new WorkflowServiceUnavailableError({
										message: "Failed to execute GitHub installation workflow",
										cause,
									}),
								),
						}),
						// What is left is the workflow's own failure union (one tag per activity).
						Effect.mapError((cause) =>
							WorkflowServiceUnavailableError.is(cause)
								? cause
								: new WorkflowInitializationError({
										message: "Failed to execute GitHub installation workflow",
										cause,
									}),
						),
					)

				return new GitHubWebhookResponse({ processed: true, messagesCreated: 0 })
			}

			const repositoryEvent = decodeRepositoryEvent(payload)
			if (Option.isNone(repositoryEvent)) {
				yield* Effect.logDebug("Skipping GitHub webhook - no installation or repository", {
					deliveryId,
					eventType,
				})
				return new GitHubWebhookResponse({ processed: false, messagesCreated: 0 })
			}
			const { installation, repository } = repositoryEvent.value

			yield* client.workflows
				.GitHubWebhookWorkflow({
					payload: {
						deliveryId,
						eventType,
						installationId: installation.id,
						repositoryId: repository.id,
						repositoryFullName: repository.full_name,
						eventPayload: payload,
					},
				})
				.pipe(
					Effect.catchTags({
						HttpClientError: (cause) =>
							Effect.fail(
								new WorkflowServiceUnavailableError({
									message: "Failed to execute GitHub webhook workflow",
									cause,
								}),
							),
					}),
					// What is left is the workflow's own failure union (one tag per activity).
					Effect.mapError((cause) =>
						WorkflowServiceUnavailableError.is(cause)
							? cause
							: new WorkflowInitializationError({
									message: "Failed to execute GitHub webhook workflow",
									cause,
								}),
					),
				)

			return new GitHubWebhookResponse({ processed: true, messagesCreated: 0 })
		}).pipe(
			Effect.catchTag("ConfigError", (cause) =>
				Effect.fail(new InternalServerError({ message: "Missing configuration", cause })),
			),
		),
	),
)
