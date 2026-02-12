import {
	FetchHttpClient,
	HttpApiScalar,
	HttpLayerRouter,
	HttpMiddleware,
	HttpServerResponse,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import {
	AttachmentRepo,
	BotCommandRepo,
	BotInstallationRepo,
	BotRepo,
	ChannelMemberRepo,
	ChannelRepo,
	ChannelSectionRepo,
	ChatSyncChannelLinkRepo,
	ChatSyncConnectionRepo,
	ChatSyncEventReceiptRepo,
	ChatSyncMessageLinkRepo,
	CustomEmojiRepo,
	ChannelWebhookRepo,
	GitHubSubscriptionRepo,
	IntegrationConnectionRepo,
	IntegrationTokenRepo,
	InvitationRepo,
	MessageReactionRepo,
	MessageRepo,
	NotificationRepo,
	OrganizationMemberRepo,
	OrganizationRepo,
	PinnedMessageRepo,
	RssSubscriptionRepo,
	TypingIndicatorRepo,
	UserPresenceStatusRepo,
	UserRepo,
	WorkOSClient,
	WorkOSSync,
} from "@hazel/backend-core"
import { Redis, RedisResultPersistenceLive, S3 } from "@hazel/effect-bun"
import { createTracingLayer } from "@hazel/effect-bun/Telemetry"
import { GitHub } from "@hazel/integrations"
import { Config, ConfigProvider, Effect, Layer } from "effect"
import { HazelApi } from "./api"
import { HttpApiRoutes } from "./http"
import { AttachmentPolicy } from "./policies/attachment-policy"
import { BotPolicy } from "./policies/bot-policy"
import { ChannelMemberPolicy } from "./policies/channel-member-policy"
import { ChannelPolicy } from "./policies/channel-policy"
import { ChannelSectionPolicy } from "./policies/channel-section-policy"
import { CustomEmojiPolicy } from "./policies/custom-emoji-policy"
import { ChannelWebhookPolicy } from "./policies/channel-webhook-policy"
import { GitHubSubscriptionPolicy } from "./policies/github-subscription-policy"
import { RssSubscriptionPolicy } from "./policies/rss-subscription-policy"
import { IntegrationConnectionPolicy } from "./policies/integration-connection-policy"
import { InvitationPolicy } from "./policies/invitation-policy"
import { MessagePolicy } from "./policies/message-policy"
import { MessageReactionPolicy } from "./policies/message-reaction-policy"
import { NotificationPolicy } from "./policies/notification-policy"
import { OrganizationMemberPolicy } from "./policies/organization-member-policy"
import { OrganizationPolicy } from "./policies/organization-policy"
import { PinnedMessagePolicy } from "./policies/pinned-message-policy"
import { TypingIndicatorPolicy } from "./policies/typing-indicator-policy"
import { UserPolicy } from "./policies/user-policy"
import { UserPresenceStatusPolicy } from "./policies/user-presence-status-policy"
import { AllRpcs, RpcServerLive } from "./rpc/server"
import { AuthorizationLive } from "./services/auth"
import { DatabaseLive } from "./services/database"
import { IntegrationTokenService } from "./services/integration-token-service"
import { IntegrationBotService } from "./services/integrations/integration-bot-service"
import { ChatSyncAttributionReconciler } from "./services/chat-sync/chat-sync-attribution-reconciler"
import { DiscordSyncWorker } from "./services/chat-sync/discord-sync-worker"
import { DiscordGatewayService } from "./services/chat-sync/discord-gateway-service"
import { MockDataGenerator } from "./services/mock-data-generator"
import { OAuthProviderRegistry } from "./services/oauth"
import { RateLimiter } from "./services/rate-limiter"
import { SessionManager } from "./services/session-manager"
import { WebhookBotService } from "./services/webhook-bot-service"
import { ChannelAccessSyncService } from "./services/channel-access-sync"
import { WorkOSAuth } from "./services/workos-auth"
import { WorkOSWebhookVerifier } from "./services/workos-webhook"

export { HazelApi }

// Export RPC groups for frontend consumption
export { AuthMiddleware, InvitationRpcs, MessageRpcs, NotificationRpcs } from "@hazel/domain/rpc"

const HealthRouter = HttpLayerRouter.use((router) =>
	router.add("GET", "/health", HttpServerResponse.text("OK")),
)

const DocsRoute = HttpApiScalar.layerHttpLayerRouter({
	api: HazelApi,
	path: "/docs",
})

// HTTP RPC endpoint
const RpcRoute = RpcServer.layerHttpRouter({
	group: AllRpcs,
	path: "/rpc",
	protocol: "http",
}).pipe(Layer.provide(RpcSerialization.layerNdjson), Layer.provide(RpcServerLive))

const AllRoutes = Layer.mergeAll(HttpApiRoutes, HealthRouter, DocsRoute, RpcRoute).pipe(
	Layer.provide(
		HttpLayerRouter.cors({
			allowedOrigins: [
				"http://localhost:3000",
				"http://localhost:5173",
				"https://app.hazel.sh",
				"tauri://localhost",
				"http://tauri.localhost",
			],
			allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
		}),
	),
)

const TracerLive = createTracingLayer("api")

const RepoLive = Layer.mergeAll(
	MessageRepo.Default,
	ChannelRepo.Default,
	ChannelMemberRepo.Default,
	ChannelSectionRepo.Default,
	ChatSyncConnectionRepo.Default,
	ChatSyncChannelLinkRepo.Default,
	ChatSyncMessageLinkRepo.Default,
	ChatSyncEventReceiptRepo.Default,
	UserRepo.Default,
	OrganizationRepo.Default,
	OrganizationMemberRepo.Default,
	InvitationRepo.Default,
	PinnedMessageRepo.Default,
	AttachmentRepo.Default,
	NotificationRepo.Default,
	TypingIndicatorRepo.Default,
	MessageReactionRepo.Default,
	UserPresenceStatusRepo.Default,
	IntegrationConnectionRepo.Default,
	IntegrationTokenRepo.Default,
	ChannelWebhookRepo.Default,
	GitHubSubscriptionRepo.Default,
	RssSubscriptionRepo.Default,
	BotRepo.Default,
	BotCommandRepo.Default,
	BotInstallationRepo.Default,
	CustomEmojiRepo.Default,
)

const PolicyLive = Layer.mergeAll(
	OrganizationPolicy.Default,
	ChannelPolicy.Default,
	ChannelSectionPolicy.Default,
	MessagePolicy.Default,
	InvitationPolicy.Default,
	OrganizationMemberPolicy.Default,
	ChannelMemberPolicy.Default,
	MessageReactionPolicy.Default,
	UserPolicy.Default,
	AttachmentPolicy.Default,
	PinnedMessagePolicy.Default,
	TypingIndicatorPolicy.Default,
	NotificationPolicy.Default,
	UserPresenceStatusPolicy.Default,
	IntegrationConnectionPolicy.Default,
	ChannelWebhookPolicy.Default,
	GitHubSubscriptionPolicy.Default,
	RssSubscriptionPolicy.Default,
	BotPolicy.Default,
	CustomEmojiPolicy.Default,
)

// ResultPersistence layer for session caching (uses Redis backing)
const PersistenceLive = RedisResultPersistenceLive.pipe(Layer.provide(Redis.Default))

const MainLive = Layer.mergeAll(
	RepoLive,
	PolicyLive,
	MockDataGenerator.Default,
	WorkOSAuth.Default,
	WorkOSClient.Default,
	WorkOSSync.Default,
	WorkOSWebhookVerifier.Default,
	DatabaseLive,
	S3.Default,
	Redis.Default,
	PersistenceLive,
	GitHub.GitHubAppJWTService.Default,
	GitHub.GitHubApiClient.Default,
	IntegrationTokenService.Default,
	OAuthProviderRegistry.Default,
	IntegrationBotService.Default,
	ChatSyncAttributionReconciler.Default,
	DiscordSyncWorker.Default,
	DiscordGatewayService.Default,
	WebhookBotService.Default,
	ChannelAccessSyncService.Default,
	RateLimiter.Default,
	// SessionManager.Default includes BackendAuth.Default via dependencies
	SessionManager.Default,
).pipe(
	Layer.provideMerge(FetchHttpClient.layer),
	Layer.provideMerge(Layer.setConfigProvider(ConfigProvider.fromEnv())),
)

HttpLayerRouter.serve(AllRoutes).pipe(
	HttpMiddleware.withTracerDisabledWhen(
		(request) => request.url === "/health" || request.method === "OPTIONS",
	),
	Layer.provide(MainLive),
	Layer.provide(TracerLive),
	Layer.provide(
		AuthorizationLive.pipe(
			// SessionManager.Default includes BackendAuth and UserRepo via dependencies
			Layer.provideMerge(SessionManager.Default),
			Layer.provideMerge(WorkOSAuth.Default),
			Layer.provideMerge(PersistenceLive),
			Layer.provideMerge(Redis.Default),
			Layer.provideMerge(DatabaseLive),
		),
	),
	Layer.provide(
		BunHttpServer.layerConfig(
			Config.all({
				port: Config.number("PORT").pipe(Config.withDefault(3003)),
				idleTimeout: Config.succeed(120),
			}),
		),
	),
	Layer.launch,
	Effect.scoped,
	BunRuntime.runMain,
)
