import { FetchHttpClient, HttpBody, HttpClient, HttpClientRequest } from "@effect/platform"
import { Duration, Effect, Schema } from "effect"

const SLACK_API_BASE_URL = "https://slack.com/api"
const DEFAULT_TIMEOUT = Duration.seconds(30)
const SLACK_THREAD_CHANNEL_DELIMITER = "::thread::"

export const createSlackThreadChannelRef = (channelId: string, threadTs: string): string =>
	`${channelId}${SLACK_THREAD_CHANNEL_DELIMITER}${threadTs}`

export const parseSlackThreadChannelRef = (
	channelReference: string,
): {
	channelId: string
	threadTs?: string
} => {
	const delimiterIndex = channelReference.indexOf(SLACK_THREAD_CHANNEL_DELIMITER)
	if (delimiterIndex === -1) {
		return { channelId: channelReference }
	}
	const channelId = channelReference.slice(0, delimiterIndex)
	const threadTs = channelReference.slice(delimiterIndex + SLACK_THREAD_CHANNEL_DELIMITER.length)
	if (!channelId || !threadTs) {
		return { channelId: channelReference }
	}
	return { channelId, threadTs }
}

export const normalizeSlackReactionName = (emoji: string): string => {
	const trimmed = emoji.trim()
	if (/^:[^:]+:$/.test(trimmed)) {
		return trimmed.slice(1, -1)
	}
	return trimmed
}

export const SlackAccountInfo = Schema.Struct({
	externalAccountId: Schema.String,
	externalAccountName: Schema.String,
	botUserId: Schema.optional(Schema.String),
	botId: Schema.optional(Schema.String),
})

export type SlackAccountInfo = typeof SlackAccountInfo.Type

export const SlackChannel = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	isPrivate: Schema.Boolean,
})

export type SlackChannel = typeof SlackChannel.Type

const SlackBaseResponse = Schema.Struct({
	ok: Schema.Boolean,
	error: Schema.optional(Schema.String),
})

const SlackAuthTestResponse = Schema.extend(
	SlackBaseResponse,
	Schema.Struct({
		team_id: Schema.optional(Schema.String),
		team: Schema.optional(Schema.String),
		user_id: Schema.optional(Schema.String),
		bot_id: Schema.optional(Schema.String),
	}),
)

const SlackConversationApiResponse = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	is_private: Schema.Boolean,
})

const SlackConversationListResponse = Schema.extend(
	SlackBaseResponse,
	Schema.Struct({
		channels: Schema.Array(SlackConversationApiResponse),
		response_metadata: Schema.optional(
			Schema.Struct({
				next_cursor: Schema.optional(Schema.String),
			}),
		),
	}),
)

const SlackChatPostMessageResponse = Schema.extend(
	SlackBaseResponse,
	Schema.Struct({
		ts: Schema.optional(Schema.String),
	}),
)

const SlackChatUpdateResponse = Schema.extend(
	SlackBaseResponse,
	Schema.Struct({
		ts: Schema.optional(Schema.String),
	}),
)

export class SlackApiError extends Schema.TaggedError<SlackApiError>()("SlackApiError", {
	message: Schema.String,
	status: Schema.optional(Schema.Number),
	cause: Schema.optional(Schema.Unknown),
}) {}

const toSlackApiError = (message: string, status?: number, cause?: unknown) =>
	new SlackApiError({ message, status, cause })

const parseSlackError = (errorCode: string | undefined, fallback: string): string => {
	if (!errorCode) {
		return fallback
	}
	if (errorCode === "invalid_auth" || errorCode === "not_authed" || errorCode === "account_inactive") {
		return "Slack authentication failed"
	}
	if (errorCode === "ratelimited") {
		return "Slack rate limit exceeded"
	}
	return `Slack API error: ${errorCode}`
}

export class SlackApiClient extends Effect.Service<SlackApiClient>()("SlackApiClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		const httpClient = yield* HttpClient.HttpClient

		const makeBearerClient = (token: string) =>
			httpClient.pipe(
				HttpClient.mapRequest(
					HttpClientRequest.setHeaders({
						Authorization: `Bearer ${token}`,
						Accept: "application/json",
					}),
				),
			)

		const readJsonBody = <A>(
			response: { json: Effect.Effect<unknown, unknown, never> },
			schema: Schema.Schema<A>,
			errorMessage: string,
		) =>
			response.json.pipe(
				Effect.flatMap(Schema.decodeUnknown(schema)),
				Effect.mapError((cause) => toSlackApiError(errorMessage, undefined, cause)),
			)

		const handleSlackResponse = <A extends { ok: boolean; error?: string }>(
			response: {
				status: number
				json: Effect.Effect<unknown, unknown, never>
			},
			schema: Schema.Schema<A>,
			fallbackMessage: string,
		) =>
			Effect.gen(function* () {
				if (response.status >= 400) {
					const bodyText = yield* response.json.pipe(
						Effect.map((value) => JSON.stringify(value)),
						Effect.catchAll(() => Effect.succeed("")),
					)
					return yield* Effect.fail(
						toSlackApiError(
							`Slack API request failed: HTTP ${response.status}${bodyText ? ` ${bodyText}` : ""}`,
							response.status,
						),
					)
				}

				const payload = yield* readJsonBody(response, schema, fallbackMessage)
				if (!payload.ok) {
					return yield* Effect.fail(
						toSlackApiError(parseSlackError(payload.error, fallbackMessage), response.status),
					)
				}
				return payload
			})

		const getAccountInfo = Effect.fn("SlackApiClient.getAccountInfo")(function* (accessToken: string) {
			const response = yield* makeBearerClient(accessToken)
				.post(`${SLACK_API_BASE_URL}/auth.test`, {
					body: HttpBody.text("", "application/x-www-form-urlencoded"),
				})
				.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

			const payload = yield* handleSlackResponse(
				response,
				SlackAuthTestResponse,
				"Failed to parse Slack auth response",
			)

			if (!payload.team_id || !payload.team) {
				return yield* Effect.fail(
					toSlackApiError(
						"Slack auth response did not include workspace information",
						response.status,
					),
				)
			}

			return {
				externalAccountId: payload.team_id,
				externalAccountName: payload.team,
				botUserId: payload.user_id,
				botId: payload.bot_id,
			} satisfies SlackAccountInfo
		})

		const listChannels = Effect.fn("SlackApiClient.listChannels")(function* (params: {
			accessToken: string
			excludeArchived?: boolean
		}) {
			const excludeArchived = params.excludeArchived ?? true
			const allChannels: Array<SlackChannel> = []
			let cursor: string | undefined

			do {
				const query = new URLSearchParams({
					limit: "1000",
					types: "public_channel,private_channel",
					...(excludeArchived ? { exclude_archived: "true" } : {}),
					...(cursor ? { cursor } : {}),
				})

				const response = yield* makeBearerClient(params.accessToken)
					.get(`${SLACK_API_BASE_URL}/conversations.list?${query.toString()}`)
					.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

				const payload = yield* handleSlackResponse(
					response,
					SlackConversationListResponse,
					"Failed to parse Slack conversations response",
				)

				for (const channel of payload.channels) {
					allChannels.push({
						id: channel.id,
						name: channel.name,
						isPrivate: channel.is_private,
					})
				}

				const nextCursor = payload.response_metadata?.next_cursor?.trim()
				cursor = nextCursor ? nextCursor : undefined
			} while (cursor)

			return allChannels
		})

		const postMessage = Effect.fn("SlackApiClient.postMessage")(function* (params: {
			accessToken: string
			channelId: string
			text: string
			threadTs?: string
		}) {
			const response = yield* makeBearerClient(params.accessToken)
				.post(`${SLACK_API_BASE_URL}/chat.postMessage`, {
					body: HttpBody.text(
						JSON.stringify({
							channel: params.channelId,
							text: params.text,
							...(params.threadTs ? { thread_ts: params.threadTs } : {}),
						}),
						"application/json",
					),
					headers: {
						"Content-Type": "application/json",
					},
				})
				.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

			const payload = yield* handleSlackResponse(
				response,
				SlackChatPostMessageResponse,
				"Failed to parse Slack chat.postMessage response",
			)

			if (!payload.ts) {
				return yield* Effect.fail(
					toSlackApiError(
						"Slack chat.postMessage response did not include message timestamp",
						response.status,
					),
				)
			}

			return payload.ts
		})

		const updateMessage = Effect.fn("SlackApiClient.updateMessage")(function* (params: {
			accessToken: string
			channelId: string
			messageTs: string
			text: string
		}) {
			const response = yield* makeBearerClient(params.accessToken)
				.post(`${SLACK_API_BASE_URL}/chat.update`, {
					body: HttpBody.text(
						JSON.stringify({
							channel: params.channelId,
							ts: params.messageTs,
							text: params.text,
						}),
						"application/json",
					),
					headers: {
						"Content-Type": "application/json",
					},
				})
				.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

			yield* handleSlackResponse(
				response,
				SlackChatUpdateResponse,
				"Failed to parse Slack chat.update response",
			)
		})

		const deleteMessage = Effect.fn("SlackApiClient.deleteMessage")(function* (params: {
			accessToken: string
			channelId: string
			messageTs: string
		}) {
			const response = yield* makeBearerClient(params.accessToken)
				.post(`${SLACK_API_BASE_URL}/chat.delete`, {
					body: HttpBody.text(
						JSON.stringify({
							channel: params.channelId,
							ts: params.messageTs,
						}),
						"application/json",
					),
					headers: {
						"Content-Type": "application/json",
					},
				})
				.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

			yield* handleSlackResponse(
				response,
				SlackBaseResponse,
				"Failed to parse Slack chat.delete response",
			)
		})

		const addReaction = Effect.fn("SlackApiClient.addReaction")(function* (params: {
			accessToken: string
			channelId: string
			messageTs: string
			reactionName: string
		}) {
			const response = yield* makeBearerClient(params.accessToken)
				.post(`${SLACK_API_BASE_URL}/reactions.add`, {
					body: HttpBody.text(
						JSON.stringify({
							channel: params.channelId,
							name: params.reactionName,
							timestamp: params.messageTs,
						}),
						"application/json",
					),
					headers: {
						"Content-Type": "application/json",
					},
				})
				.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

			yield* handleSlackResponse(
				response,
				SlackBaseResponse,
				"Failed to parse Slack reactions.add response",
			)
		})

		const removeReaction = Effect.fn("SlackApiClient.removeReaction")(function* (params: {
			accessToken: string
			channelId: string
			messageTs: string
			reactionName: string
		}) {
			const response = yield* makeBearerClient(params.accessToken)
				.post(`${SLACK_API_BASE_URL}/reactions.remove`, {
					body: HttpBody.text(
						JSON.stringify({
							channel: params.channelId,
							name: params.reactionName,
							timestamp: params.messageTs,
						}),
						"application/json",
					),
					headers: {
						"Content-Type": "application/json",
					},
				})
				.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

			yield* handleSlackResponse(
				response,
				SlackBaseResponse,
				"Failed to parse Slack reactions.remove response",
			)
		})

		return {
			getAccountInfo,
			listChannels,
			postMessage,
			updateMessage,
			deleteMessage,
			addReaction,
			removeReaction,
		}
	}),
	dependencies: [FetchHttpClient.layer],
}) {}
