import { Discord } from "@hazel/integrations"
import { Config, Effect, Option, Redacted, Schema } from "effect"

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

			const discordAdapter: ChatSyncProviderAdapter = {
				provider: "discord",
				createMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						return yield* Discord.DiscordApiClient.createMessage({
							channelId: params.externalChannelId,
							content: params.content,
							replyToMessageId: params.replyToExternalMessageId,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
							Effect.mapError(
								(error) =>
									new ChatSyncProviderApiError({
										provider: "discord",
										message: error.message,
										status: getStatusCode(error),
										detail: String(error),
									}),
							),
						)
					}),
				updateMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* Discord.DiscordApiClient.updateMessage({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							content: params.content,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
							Effect.mapError(
								(error) =>
									new ChatSyncProviderApiError({
										provider: "discord",
										message: error.message,
										status: getStatusCode(error),
										detail: String(error),
									}),
							),
						)
					}),
				deleteMessage: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* Discord.DiscordApiClient.deleteMessage({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
							Effect.mapError(
								(error) =>
									new ChatSyncProviderApiError({
										provider: "discord",
										message: error.message,
										status: getStatusCode(error),
										detail: String(error),
									}),
							),
						)
					}),
				addReaction: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* Discord.DiscordApiClient.addReaction({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							emoji: params.emoji,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
							Effect.mapError(
								(error) =>
									new ChatSyncProviderApiError({
										provider: "discord",
										message: error.message,
										status: getStatusCode(error),
										detail: String(error),
									}),
							),
						)
					}),
				removeReaction: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						yield* Discord.DiscordApiClient.removeReaction({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							emoji: params.emoji,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
							Effect.mapError(
								(error) =>
									new ChatSyncProviderApiError({
										provider: "discord",
										message: error.message,
										status: getStatusCode(error),
										detail: String(error),
									}),
							),
						)
					}),
				createThread: (params) =>
					Effect.gen(function* () {
						const token = yield* getDiscordToken()
						return yield* Discord.DiscordApiClient.createThread({
							channelId: params.externalChannelId,
							messageId: params.externalMessageId,
							name: params.name,
							botToken: token,
						}).pipe(
							Effect.provide(Discord.DiscordApiClient.Default),
							Effect.mapError(
								(error) =>
									new ChatSyncProviderApiError({
										provider: "discord",
										message: error.message,
										status: getStatusCode(error),
										detail: String(error),
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
