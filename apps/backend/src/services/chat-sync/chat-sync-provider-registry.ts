import { Discord, Slack } from "@hazel/integrations"
import { Config, Effect, Option, Redacted, Schema, Schedule } from "effect"
import {
	type ChatSyncOutboundAttachment,
	formatMessageContentWithAttachments,
} from "./chat-sync-attachment-content"

export class ChatSyncProviderNotSupportedError extends Schema.TaggedError<ChatSyncProviderNotSupportedError>()(
	"ChatSyncProviderNotSupportedError",
	{
		provider: Schema.String,
	},
) {}

export class ChatSyncProviderConfigurationError extends Schema.TaggedError<ChatSyncProviderConfigurationError>()(
	"ChatSyncProviderConfigurationError",
	{
		provider: Schema.String,
		message: Schema.String,
	},
) {}

export class ChatSyncProviderApiError extends Schema.TaggedError<ChatSyncProviderApiError>()(
	"ChatSyncProviderApiError",
	{
		provider: Schema.String,
		message: Schema.String,
		status: Schema.optional(Schema.Number),
		detail: Schema.optional(Schema.String),
	},
) {}

import { ExternalChannelId, ExternalMessageId, ExternalThreadId } from "@hazel/schema"

export interface ChatSyncProviderAdapter {
	readonly provider: string
	readonly createMessage: (params: {
		externalChannelId: ExternalChannelId
		content: string
		accessToken?: string
		replyToExternalMessageId?: ExternalMessageId
	}) => Effect.Effect<ExternalMessageId, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly createMessageWithAttachments: (params: {
		externalChannelId: ExternalChannelId
		content: string
		attachments: ReadonlyArray<ChatSyncOutboundAttachment>
		accessToken?: string
		replyToExternalMessageId?: ExternalMessageId
	}) => Effect.Effect<ExternalMessageId, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly updateMessage: (params: {
		externalChannelId: ExternalChannelId
		externalMessageId: ExternalMessageId
		content: string
		accessToken?: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly deleteMessage: (params: {
		externalChannelId: ExternalChannelId
		externalMessageId: ExternalMessageId
		accessToken?: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly addReaction: (params: {
		externalChannelId: ExternalChannelId
		externalMessageId: ExternalMessageId
		emoji: string
		accessToken?: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly removeReaction: (params: {
		externalChannelId: ExternalChannelId
		externalMessageId: ExternalMessageId
		emoji: string
		accessToken?: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly createThread: (params: {
		externalChannelId: ExternalChannelId
		externalMessageId: ExternalMessageId
		name: string
		accessToken?: string
	}) => Effect.Effect<ExternalThreadId, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
}

const DISCORD_MAX_MESSAGE_LENGTH = 2000
const DISCORD_SNOWFLAKE_MIN_LENGTH = 17
const DISCORD_SNOWFLAKE_MAX_LENGTH = 30
const DISCORD_THREAD_NAME_MAX_LENGTH = 100
const DISCORD_SYNC_RETRY_SCHEDULE = Schedule.intersect(
	Schedule.exponential("250 millis").pipe(Schedule.jittered),
	Schedule.recurs(3),
)
const SLACK_MAX_MESSAGE_LENGTH = 40000

const isDiscordSnowflake = (value: string): boolean =>
	/^\d+$/.test(value) &&
	value.length >= DISCORD_SNOWFLAKE_MIN_LENGTH &&
	value.length <= DISCORD_SNOWFLAKE_MAX_LENGTH

export class ChatSyncProviderRegistry extends Effect.Service<ChatSyncProviderRegistry>()(
	"ChatSyncProviderRegistry",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const discordApiClient = yield* Discord.DiscordApiClient
			const slackApiClient = yield* Slack.SlackApiClient

			const getDiscordToken = Effect.fn("ChatSyncProviderRegistry.getDiscordToken")(function* () {
				const discordBotToken = yield* Config.redacted("DISCORD_BOT_TOKEN").pipe(Effect.option)
				if (Option.isNone(discordBotToken)) {
					return yield* Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: "DISCORD_BOT_TOKEN is not configured",
						}),
					)
				}
				return Redacted.value(discordBotToken.value)
			})

			const getStatusCode = (error: unknown): number | undefined => {
				if (typeof error !== "object" || error === null || !("status" in error)) {
					return undefined
				}

				const status = (error as { status: unknown }).status
				return typeof status === "number" ? status : undefined
			}

			const getSlackAccessToken = (accessToken: string | undefined) =>
				Effect.gen(function* () {
					if (!accessToken || !accessToken.trim()) {
						return yield* Effect.fail(
							new ChatSyncProviderConfigurationError({
								provider: "slack",
								message:
									"Slack access token is missing; reconnect Slack integration for this workspace",
							}),
						)
					}
					return accessToken.trim()
				})

			const isRetryableDiscordError = (error: unknown): boolean => {
				const status = getStatusCode(error)
				if (status === undefined) {
					return false
				}
				return status === 429 || status === 408 || (status >= 500 && status < 600)
			}

			const isRetryableSlackError = (error: unknown): boolean => {
				const status = getStatusCode(error)
				if (status === undefined) {
					return false
				}
				return status === 429 || status === 408 || (status >= 500 && status < 600)
			}

			const validateDiscordId = (value: string, field: string) => {
				if (!isDiscordSnowflake(value)) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: `${field} must be a valid Discord snowflake`,
						}),
					)
				}
				return Effect.void
			}

			const validateDiscordMessage = (content: string) => {
				if (content.length === 0) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: "Message content cannot be empty",
						}),
					)
				}
				if (content.length > DISCORD_MAX_MESSAGE_LENGTH) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: `Message content exceeds Discord limit of ${DISCORD_MAX_MESSAGE_LENGTH} characters`,
						}),
					)
				}
				return Effect.void
			}

			const validateDiscordEmoji = (emoji: string) => {
				if (!emoji.trim()) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: "Reaction emoji cannot be empty",
						}),
					)
				}
				return Effect.void
			}

			const validateDiscordThreadName = (name: string) => {
				if (!name.trim()) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: "Thread name cannot be empty",
						}),
					)
				}
				if (name.length > DISCORD_THREAD_NAME_MAX_LENGTH) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "discord",
							message: "Thread name is too long",
						}),
					)
				}
				return Effect.void
			}

			const validateSlackMessage = (content: string) => {
				if (content.length === 0) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "slack",
							message: "Message content cannot be empty",
						}),
					)
				}
				if (content.length > SLACK_MAX_MESSAGE_LENGTH) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "slack",
							message: `Message content exceeds Slack limit of ${SLACK_MAX_MESSAGE_LENGTH} characters`,
						}),
					)
				}
				return Effect.void
			}

			const validateSlackEmoji = (emoji: string) => {
				if (!emoji.trim()) {
					return Effect.fail(
						new ChatSyncProviderConfigurationError({
							provider: "slack",
							message: "Reaction emoji cannot be empty",
						}),
					)
				}
				return Effect.void
			}

			const toDiscordContent = (params: {
				content: string
				attachments: ReadonlyArray<ChatSyncOutboundAttachment>
			}) =>
				formatMessageContentWithAttachments({
					content: params.content,
					attachments: params.attachments,
					maxLength: DISCORD_MAX_MESSAGE_LENGTH,
				})

			const toSlackContent = (params: {
				content: string
				attachments: ReadonlyArray<ChatSyncOutboundAttachment>
			}) =>
				formatMessageContentWithAttachments({
					content: params.content,
					attachments: params.attachments,
					maxLength: SLACK_MAX_MESSAGE_LENGTH,
				})

			const discordAdapter: ChatSyncProviderAdapter = {
				provider: "discord",
				createMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordMessage(params.content)
						if (params.replyToExternalMessageId) {
							yield* validateDiscordId(
								params.replyToExternalMessageId,
								"replyToExternalMessageId",
							)
						}
						return yield* discordApiClient
							.createMessage({
								channelId: params.externalChannelId,
								content: params.content,
								replyToMessageId: params.replyToExternalMessageId,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
								Effect.map((messageId) => messageId as ExternalMessageId),
							)
					}),
				createMessageWithAttachments: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						if (params.replyToExternalMessageId) {
							yield* validateDiscordId(
								params.replyToExternalMessageId,
								"replyToExternalMessageId",
							)
						}
						const content = toDiscordContent({
							content: params.content,
							attachments: params.attachments,
						})
						yield* validateDiscordMessage(content)
						return yield* discordApiClient
							.createMessage({
								channelId: params.externalChannelId,
								content,
								replyToMessageId: params.replyToExternalMessageId,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
								Effect.map((messageId) => messageId as ExternalMessageId),
							)
					}),
				updateMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordId(params.externalMessageId, "externalMessageId")
						yield* validateDiscordMessage(params.content)
						yield* discordApiClient
							.updateMessage({
								channelId: params.externalChannelId,
								messageId: params.externalMessageId,
								content: params.content,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				deleteMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordId(params.externalMessageId, "externalMessageId")
						yield* discordApiClient
							.deleteMessage({
								channelId: params.externalChannelId,
								messageId: params.externalMessageId,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				addReaction: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordId(params.externalMessageId, "externalMessageId")
						yield* validateDiscordEmoji(params.emoji)
						yield* discordApiClient
							.addReaction({
								channelId: params.externalChannelId,
								messageId: params.externalMessageId,
								emoji: params.emoji,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				removeReaction: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordId(params.externalMessageId, "externalMessageId")
						yield* validateDiscordEmoji(params.emoji)
						yield* discordApiClient
							.removeReaction({
								channelId: params.externalChannelId,
								messageId: params.externalMessageId,
								emoji: params.emoji,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				createThread: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordId(params.externalMessageId, "externalMessageId")
						yield* validateDiscordThreadName(params.name)
						return yield* discordApiClient
							.createThread({
								channelId: params.externalChannelId,
								messageId: params.externalMessageId,
								name: params.name,
								botToken: token,
							})
							.pipe(
								Effect.retry({
									while: isRetryableDiscordError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "discord",
											message: error.message,
											status: getStatusCode(error),
											detail: `discord_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
								Effect.map((threadId) => threadId as ExternalThreadId),
							)
					}),
			}

			const slackAdapter: ChatSyncProviderAdapter = {
				provider: "slack",
				createMessage: (params) =>
					Effect.gen(function* () {
						const accessToken = yield* getSlackAccessToken(params.accessToken)
						yield* validateSlackMessage(params.content)

						const channelRef = Slack.parseSlackThreadChannelRef(params.externalChannelId)
						const threadTs = channelRef.threadTs ?? params.replyToExternalMessageId
						return yield* slackApiClient
							.postMessage({
								accessToken,
								channelId: channelRef.channelId,
								text: params.content,
								threadTs,
							})
							.pipe(
								Effect.retry({
									while: isRetryableSlackError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "slack",
											message: error.message,
											status: getStatusCode(error),
											detail: `slack_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
								Effect.map((messageTs) => messageTs as ExternalMessageId),
							)
					}),
				createMessageWithAttachments: (params) =>
					Effect.gen(function* () {
						const accessToken = yield* getSlackAccessToken(params.accessToken)
						const content = toSlackContent({
							content: params.content,
							attachments: params.attachments,
						})
						yield* validateSlackMessage(content)

						const channelRef = Slack.parseSlackThreadChannelRef(params.externalChannelId)
						const threadTs = channelRef.threadTs ?? params.replyToExternalMessageId
						return yield* slackApiClient
							.postMessage({
								accessToken,
								channelId: channelRef.channelId,
								text: content,
								threadTs,
							})
							.pipe(
								Effect.retry({
									while: isRetryableSlackError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "slack",
											message: error.message,
											status: getStatusCode(error),
											detail: `slack_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
								Effect.map((messageTs) => messageTs as ExternalMessageId),
							)
					}),
				updateMessage: (params) =>
					Effect.gen(function* () {
						const accessToken = yield* getSlackAccessToken(params.accessToken)
						yield* validateSlackMessage(params.content)

						const channelRef = Slack.parseSlackThreadChannelRef(params.externalChannelId)
						yield* slackApiClient
							.updateMessage({
								accessToken,
								channelId: channelRef.channelId,
								messageTs: params.externalMessageId,
								text: params.content,
							})
							.pipe(
								Effect.retry({
									while: isRetryableSlackError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "slack",
											message: error.message,
											status: getStatusCode(error),
											detail: `slack_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				deleteMessage: (params) =>
					Effect.gen(function* () {
						const accessToken = yield* getSlackAccessToken(params.accessToken)
						const channelRef = Slack.parseSlackThreadChannelRef(params.externalChannelId)

						yield* slackApiClient
							.deleteMessage({
								accessToken,
								channelId: channelRef.channelId,
								messageTs: params.externalMessageId,
							})
							.pipe(
								Effect.retry({
									while: isRetryableSlackError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "slack",
											message: error.message,
											status: getStatusCode(error),
											detail: `slack_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				addReaction: (params) =>
					Effect.gen(function* () {
						const accessToken = yield* getSlackAccessToken(params.accessToken)
						yield* validateSlackEmoji(params.emoji)
						const channelRef = Slack.parseSlackThreadChannelRef(params.externalChannelId)

						yield* slackApiClient
							.addReaction({
								accessToken,
								channelId: channelRef.channelId,
								messageTs: params.externalMessageId,
								reactionName: Slack.normalizeSlackReactionName(params.emoji),
							})
							.pipe(
								Effect.retry({
									while: isRetryableSlackError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "slack",
											message: error.message,
											status: getStatusCode(error),
											detail: `slack_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				removeReaction: (params) =>
					Effect.gen(function* () {
						const accessToken = yield* getSlackAccessToken(params.accessToken)
						yield* validateSlackEmoji(params.emoji)
						const channelRef = Slack.parseSlackThreadChannelRef(params.externalChannelId)

						yield* slackApiClient
							.removeReaction({
								accessToken,
								channelId: channelRef.channelId,
								messageTs: params.externalMessageId,
								reactionName: Slack.normalizeSlackReactionName(params.emoji),
							})
							.pipe(
								Effect.retry({
									while: isRetryableSlackError,
									schedule: DISCORD_SYNC_RETRY_SCHEDULE,
								}),
								Effect.mapError(
									(error) =>
										new ChatSyncProviderApiError({
											provider: "slack",
											message: error.message,
											status: getStatusCode(error),
											detail: `slack_api_status_${getStatusCode(error) ?? "unknown"}`,
										}),
								),
							)
					}),
				createThread: (params) =>
					Effect.gen(function* () {
						yield* getSlackAccessToken(params.accessToken)
						return Slack.createSlackThreadChannelRef(
							params.externalChannelId,
							params.externalMessageId,
						) as ExternalThreadId
					}),
			}

			const adapters = {
				discord: discordAdapter,
				slack: slackAdapter,
			} as const satisfies Record<string, ChatSyncProviderAdapter>

			const getAdapter = Effect.fn("ChatSyncProviderRegistry.getAdapter")(function* (provider: string) {
				const adapter = Option.fromNullable(adapters[provider as keyof typeof adapters])
				return yield* Option.match(adapter, {
					onNone: () =>
						Effect.fail(
							new ChatSyncProviderNotSupportedError({
								provider,
							}),
						),
					onSome: Effect.succeed,
				})
			})

			return { getAdapter }
		}),
		dependencies: [Discord.DiscordApiClient.Default, Slack.SlackApiClient.Default],
	},
) {}
