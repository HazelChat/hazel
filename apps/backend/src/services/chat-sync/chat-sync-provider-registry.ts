import { Discord } from "@hazel/integrations"
import { Config, Effect, Option, Redacted, Schema, Schedule } from "effect"

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

export interface ChatSyncProviderAdapter {
	readonly provider: string
	readonly createMessage: (params: {
		externalChannelId: string
		content: string
		replyToExternalMessageId?: string
	}) => Effect.Effect<string, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly updateMessage: (params: {
		externalChannelId: string
		externalMessageId: string
		content: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly deleteMessage: (params: {
		externalChannelId: string
		externalMessageId: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly addReaction: (params: {
		externalChannelId: string
		externalMessageId: string
		emoji: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly removeReaction: (params: {
		externalChannelId: string
		externalMessageId: string
		emoji: string
	}) => Effect.Effect<void, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
	readonly createThread: (params: {
		externalChannelId: string
		externalMessageId: string
		name: string
	}) => Effect.Effect<string, ChatSyncProviderConfigurationError | ChatSyncProviderApiError>
}

const DISCORD_MAX_MESSAGE_LENGTH = 2000
const DISCORD_SNOWFLAKE_MIN_LENGTH = 17
const DISCORD_SNOWFLAKE_MAX_LENGTH = 30
const DISCORD_THREAD_NAME_MAX_LENGTH = 100
const DISCORD_SYNC_RETRY_SCHEDULE = Schedule.intersect(
	Schedule.exponential("250 millis").pipe(Schedule.jittered),
	Schedule.recurs(3),
)

const isDiscordSnowflake = (value: string): boolean =>
	/^\d+$/.test(value) &&
	value.length >= DISCORD_SNOWFLAKE_MIN_LENGTH &&
	value.length <= DISCORD_SNOWFLAKE_MAX_LENGTH

export class ChatSyncProviderRegistry extends Effect.Service<ChatSyncProviderRegistry>()(
	"ChatSyncProviderRegistry",
	{
		accessors: true,
		effect: Effect.gen(function* () {
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

			const isRetryableDiscordError = (error: unknown): boolean => {
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

			const discordAdapter: ChatSyncProviderAdapter = {
				provider: "discord",
				createMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordMessage(params.content)
						if (params.replyToExternalMessageId) {
							yield* validateDiscordId(params.replyToExternalMessageId, "replyToExternalMessageId")
						}
						return yield* Discord.DiscordApiClient.createMessage({
							channelId: params.externalChannelId,
							content: params.content,
							replyToMessageId: params.replyToExternalMessageId,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
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
				updateMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* validateDiscordId(params.externalChannelId, "externalChannelId")
						yield* validateDiscordId(params.externalMessageId, "externalMessageId")
						yield* validateDiscordMessage(params.content)
						yield* Discord.DiscordApiClient.updateMessage({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							content: params.content,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
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
						yield* Discord.DiscordApiClient.deleteMessage({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
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
						yield* Discord.DiscordApiClient.addReaction({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							emoji: params.emoji,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
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
						yield* Discord.DiscordApiClient.removeReaction({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							emoji: params.emoji,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
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
						return yield* Discord.DiscordApiClient.createThread({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							name: params.name,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
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
			}

			const adapters = {
				discord: discordAdapter,
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
	},
) {}
