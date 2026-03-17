import { createHash } from "node:crypto"
import { Redis, type RedisErrors } from "@hazel/effect-bun"
import {
	InternalServerError,
	OAuthCodeExpiredError,
	OAuthRedemptionPendingError,
	OAuthStateMismatchError,
} from "@hazel/domain"
import { TokenResponse } from "@hazel/domain/http"
import { Duration, Effect, Layer, Schema, ServiceMap } from "effect"

const AUTH_REDEMPTION_PREFIX = "auth:redemption"
const PROCESSING_TTL_MS = 30_000
const RESULT_TTL_MS = 5 * 60_000
const POLL_INTERVAL = Duration.millis(50)
const POLL_TIMEOUT_MS = 2_000

const CLAIM_PROCESSING_SCRIPT = `
local key = KEYS[1]
local processingValue = ARGV[1]
local ttlMs = ARGV[2]

local existing = redis.call("GET", key)
if not existing then
  redis.call("SET", key, processingValue, "PX", ttlMs)
  return { "claimed", "" }
end

return { "existing", existing }
`

const PermanentFailureSchema = Schema.Struct({
	_tag: Schema.Literal("OAuthCodeExpiredError"),
	message: Schema.String,
})

const ProcessingRecordSchema = Schema.Struct({
	status: Schema.Literal("processing"),
	requestHash: Schema.String,
	codeHash: Schema.String,
	createdAt: Schema.Number,
})

const SucceededRecordSchema = Schema.Struct({
	status: Schema.Literal("succeeded"),
	requestHash: Schema.String,
	codeHash: Schema.String,
	createdAt: Schema.Number,
	response: TokenResponse,
})

const FailedPermanentRecordSchema = Schema.Struct({
	status: Schema.Literal("failed_permanent"),
	requestHash: Schema.String,
	codeHash: Schema.String,
	createdAt: Schema.Number,
	error: PermanentFailureSchema,
})

const StoredRedemptionSchema = Schema.Union([
	ProcessingRecordSchema,
	SucceededRecordSchema,
	FailedPermanentRecordSchema,
])

type StoredRedemption = Schema.Schema.Type<typeof StoredRedemptionSchema>
type TokenExchangeResponse = Schema.Schema.Type<typeof TokenResponse>
type ClaimResult = { _tag: "claimed" } | { _tag: "existing"; record: StoredRedemption }
type ExchangeResult =
	| { _tag: "success"; response: TokenExchangeResponse }
	| { _tag: "expired"; error: OAuthCodeExpiredError }
	| { _tag: "internal"; error: InternalServerError }

const mapRedisError = (message: string) => (error: RedisErrors) =>
	new InternalServerError({
		message,
		detail: String(error),
		cause: error,
	})

const hashString = (value: string): string => createHash("sha256").update(value).digest("hex")

const normalizeJsonValue = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(normalizeJsonValue)
	}

	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, nested]) => [key, normalizeJsonValue(nested)]),
		)
	}

	return value
}

const canonicalizeState = (state: string): string => {
	try {
		return JSON.stringify(normalizeJsonValue(JSON.parse(state)))
	} catch {
		return state
	}
}

const getCodeHash = (code: string): string => hashString(code)
const getStateHash = (state: string): string => hashString(canonicalizeState(state))
const getRequestHash = (code: string, state: string): string =>
	hashString(JSON.stringify({ code, state: canonicalizeState(state) }))

const getRedisKey = (codeHash: string): string => `${AUTH_REDEMPTION_PREFIX}:${codeHash}`
const shortHash = (value: string): string => value.slice(0, 12)

const decodeStoredRedemption = (raw: string): Effect.Effect<StoredRedemption, InternalServerError> =>
	Effect.try({
		try: () => Schema.decodeSync(StoredRedemptionSchema)(JSON.parse(raw)),
		catch: (cause) =>
			new InternalServerError({
				message: "Failed to decode cached auth redemption",
				detail: String(cause),
				cause,
			}),
	})

const encodeStoredRedemption = (record: StoredRedemption): Effect.Effect<string, InternalServerError> =>
	Effect.try({
		try: () => JSON.stringify(record),
		catch: (cause) =>
			new InternalServerError({
				message: "Failed to encode auth redemption state",
				detail: String(cause),
				cause,
			}),
	})

const toPermanentFailure = (
	error: OAuthCodeExpiredError,
): Schema.Schema.Type<typeof PermanentFailureSchema> => ({
	_tag: "OAuthCodeExpiredError",
	message: error.message,
})

const ensureMatchingRequest = (
	record: StoredRedemption,
	requestHash: string,
): Effect.Effect<void, OAuthStateMismatchError> =>
	record.requestHash === requestHash
		? Effect.void
		: Effect.fail(
				new OAuthStateMismatchError({
					message:
						"Received a duplicate OAuth redemption with mismatched state. Please restart login.",
				}),
			)

const revivePermanentFailure = (
	error: Schema.Schema.Type<typeof PermanentFailureSchema>,
): OAuthCodeExpiredError =>
	new OAuthCodeExpiredError({
		message: error.message,
	})

export class AuthRedemptionStore extends ServiceMap.Service<AuthRedemptionStore>()("AuthRedemptionStore", {
	make: Effect.gen(function* () {
		const redis = yield* Redis

		const writeRecord = (key: string, record: StoredRedemption, ttlMs: number) =>
			Effect.gen(function* () {
				const value = yield* encodeStoredRedemption(record)
				yield* redis
					.send("SET", [key, value, "PX", String(ttlMs)])
					.pipe(Effect.mapError(mapRedisError("Failed to persist OAuth redemption state")))
			})

		const deleteRecord = (key: string) =>
			redis.del(key).pipe(Effect.mapError(mapRedisError("Failed to clear OAuth redemption state")))

		const readRecord = (key: string) =>
			Effect.gen(function* () {
				const raw = yield* redis
					.get(key)
					.pipe(Effect.mapError(mapRedisError("Failed to read OAuth redemption state")))

				if (raw === null) {
					return null
				}

				return yield* decodeStoredRedemption(raw).pipe(
					Effect.catchTag("InternalServerError", (error) =>
						deleteRecord(key).pipe(Effect.flatMap(() => Effect.fail(error))),
					),
				)
			})

		const claimProcessing = (key: string, record: Schema.Schema.Type<typeof ProcessingRecordSchema>) =>
			Effect.gen(function* () {
				const processingValue = yield* encodeStoredRedemption(record)
				const [status, existingValue] = yield* redis
					.send<[string, string]>("EVAL", [
						CLAIM_PROCESSING_SCRIPT,
						"1",
						key,
						processingValue,
						String(PROCESSING_TTL_MS),
					])
					.pipe(Effect.mapError(mapRedisError("Failed to claim OAuth redemption state")))

				if (status === "claimed") {
					return { _tag: "claimed" } satisfies ClaimResult
				}

				const existingRecord = yield* decodeStoredRedemption(existingValue)
				return {
					_tag: "existing",
					record: existingRecord,
				} satisfies ClaimResult
			})

		const awaitCompletion = (
			key: string,
			requestHash: string,
			codeHash: string,
			stateHash: string,
			attemptId: string,
			startedAt: number,
		): Effect.Effect<
			TokenExchangeResponse | null,
			| OAuthCodeExpiredError
			| OAuthStateMismatchError
			| OAuthRedemptionPendingError
			| InternalServerError
		> =>
			Effect.gen(function* () {
				const current = yield* readRecord(key)
				if (current === null) {
					yield* Effect.logInfo("[auth/token] Redemption lock cleared before completion", {
						attemptId,
						codeHash: shortHash(codeHash),
						stateHash: shortHash(stateHash),
						outcome: "lock_cleared",
					})
					return null
				}

				yield* ensureMatchingRequest(current, requestHash)

				switch (current.status) {
					case "succeeded":
						yield* Effect.logInfo("[auth/token] Reused cached OAuth redemption", {
							attemptId,
							codeHash: shortHash(codeHash),
							stateHash: shortHash(stateHash),
							outcome: "awaited_success",
						})
						return current.response
					case "failed_permanent":
						yield* Effect.logInfo("[auth/token] Reused cached OAuth redemption failure", {
							attemptId,
							codeHash: shortHash(codeHash),
							stateHash: shortHash(stateHash),
							outcome: "awaited_failure",
							errorTag: current.error._tag,
						})
						return yield* Effect.fail(revivePermanentFailure(current.error))
					case "processing":
						if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
							yield* Effect.logError(
								"[auth/token] OAuth redemption still pending after poll timeout",
								{
									attemptId,
									codeHash: shortHash(codeHash),
									stateHash: shortHash(stateHash),
									outcome: "pending_timeout",
								},
							)
							return yield* Effect.fail(
								new OAuthRedemptionPendingError({
									message:
										"Another login callback is still finishing. Please retry in a moment.",
								}),
							)
						}

						yield* Effect.sleep(POLL_INTERVAL)
						return yield* awaitCompletion(
							key,
							requestHash,
							codeHash,
							stateHash,
							attemptId,
							startedAt,
						)
				}
			})

		const exchangeCodeOnce = <R>(
			params: {
				code: string
				state: string
				attemptId?: string
			},
			exchange: Effect.Effect<TokenExchangeResponse, OAuthCodeExpiredError | InternalServerError, R>,
		): Effect.Effect<
			TokenExchangeResponse,
			| OAuthCodeExpiredError
			| OAuthStateMismatchError
			| OAuthRedemptionPendingError
			| InternalServerError,
			R
		> =>
			Effect.gen(function* () {
				const codeHash = getCodeHash(params.code)
				const stateHash = getStateHash(params.state)
				const requestHash = getRequestHash(params.code, params.state)
				const key = getRedisKey(codeHash)
				const createdAt = Date.now()
				const attemptId = params.attemptId ?? "missing"

				yield* Effect.logInfo("[auth/token] OAuth redemption requested", {
					attemptId,
					codeHash: shortHash(codeHash),
					stateHash: shortHash(stateHash),
					requestHash: shortHash(requestHash),
					outcome: "requested",
				})

				const processingRecord = {
					status: "processing" as const,
					requestHash,
					codeHash,
					createdAt,
				}

				const claimResult: ClaimResult = yield* claimProcessing(key, processingRecord)
				if (claimResult._tag === "existing") {
					yield* ensureMatchingRequest(claimResult.record, requestHash).pipe(
						Effect.catchTag("OAuthStateMismatchError", (error) =>
							Effect.logError("[auth/token] OAuth redemption state mismatch", {
								attemptId,
								codeHash: shortHash(codeHash),
								stateHash: shortHash(stateHash),
								outcome: "mismatch",
							}).pipe(Effect.flatMap(() => Effect.fail(error))),
						),
					)

					if (claimResult.record.status === "processing") {
						yield* Effect.logInfo("[auth/token] Waiting for in-flight OAuth redemption", {
							attemptId,
							codeHash: shortHash(codeHash),
							stateHash: shortHash(stateHash),
							outcome: "waiting",
						})
						const awaited = yield* awaitCompletion(
							key,
							requestHash,
							codeHash,
							stateHash,
							attemptId,
							Date.now(),
						)
						if (awaited !== null) {
							return awaited
						}
						return yield* exchangeCodeOnce(params, exchange)
					}

					if (claimResult.record.status === "succeeded") {
						yield* Effect.logInfo("[auth/token] Returning cached OAuth redemption", {
							attemptId,
							codeHash: shortHash(codeHash),
							stateHash: shortHash(stateHash),
							outcome: "cached_success",
						})
						return claimResult.record.response
					}

					yield* Effect.logInfo("[auth/token] Returning cached OAuth redemption failure", {
						attemptId,
						codeHash: shortHash(codeHash),
						stateHash: shortHash(stateHash),
						outcome: "cached_failure",
						errorTag: claimResult.record.error._tag,
					})
					return yield* Effect.fail(revivePermanentFailure(claimResult.record.error))
				}

				yield* Effect.logInfo("[auth/token] Claim acquired, redeeming with WorkOS", {
					attemptId,
					codeHash: shortHash(codeHash),
					stateHash: shortHash(stateHash),
					outcome: "fresh",
				})

				const exchangeResult: ExchangeResult = yield* exchange.pipe(
					Effect.map((response) => ({ _tag: "success", response }) satisfies ExchangeResult),
					Effect.catchTag("OAuthCodeExpiredError", (error) =>
						Effect.succeed({ _tag: "expired", error } satisfies ExchangeResult),
					),
					Effect.catchTag("InternalServerError", (error) =>
						Effect.succeed({ _tag: "internal", error } satisfies ExchangeResult),
					),
				)

				switch (exchangeResult._tag) {
					case "success":
						yield* writeRecord(
							key,
							{
								status: "succeeded",
								requestHash,
								codeHash,
								createdAt,
								response: exchangeResult.response,
							},
							RESULT_TTL_MS,
						)
						yield* Effect.logInfo("[auth/token] OAuth redemption completed", {
							attemptId,
							codeHash: shortHash(codeHash),
							stateHash: shortHash(stateHash),
							outcome: "succeeded",
						})
						return exchangeResult.response
					case "expired":
						yield* writeRecord(
							key,
							{
								status: "failed_permanent",
								requestHash,
								codeHash,
								createdAt,
								error: toPermanentFailure(exchangeResult.error),
							},
							RESULT_TTL_MS,
						)
						yield* Effect.logInfo(
							"[auth/token] OAuth redemption completed with permanent failure",
							{
								attemptId,
								codeHash: shortHash(codeHash),
								stateHash: shortHash(stateHash),
								outcome: "expired",
								errorTag: exchangeResult.error._tag,
							},
						)
						return yield* Effect.fail(exchangeResult.error)
					case "internal":
						yield* deleteRecord(key)
						yield* Effect.logError(
							"[auth/token] OAuth redemption reset after transient failure",
							{
								attemptId,
								codeHash: shortHash(codeHash),
								stateHash: shortHash(stateHash),
								outcome: "transient_reset",
								errorTag: exchangeResult.error._tag,
							},
						)
						return yield* Effect.fail(exchangeResult.error)
				}
			}).pipe(
				Effect.annotateLogs({
					authAttemptId: params.attemptId ?? "missing",
					authCodeHash: shortHash(getCodeHash(params.code)),
					authStateHash: shortHash(getStateHash(params.state)),
				}),
				Effect.withSpan("AuthRedemptionStore.exchangeCodeOnce"),
			)

		return {
			exchangeCodeOnce,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(Redis.Default))
}
