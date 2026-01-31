import {
	FetchHttpClient,
	HttpApiScalar,
	HttpLayerRouter,
	HttpMiddleware,
	HttpServerResponse,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Redis, RedisResultPersistenceLive, S3 } from "@hazel/effect-bun"
import { createTracingLayer } from "@hazel/effect-bun/Telemetry"
import { GitHub } from "@hazel/integrations"
import { Config, Layer } from "effect"
import { HazelApi } from "./api"
import { HttpApiRoutes } from "./http"
import { AgentSessionPolicy } from "./policies/agent-session-policy"
import { AttachmentPolicy } from "./policies/attachment-policy"
import { BotPolicy } from "./policies/bot-policy"
import { ChannelMemberPolicy } from "./policies/channel-member-policy"
import { ChannelPolicy } from "./policies/channel-policy"
import { ChannelSectionPolicy } from "./policies/channel-section-policy"
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
import { SandboxPolicy } from "./policies/sandbox-policy"
import { TypingIndicatorPolicy } from "./policies/typing-indicator-policy"
import { UserCredentialPolicy } from "./policies/user-credential-policy"
import { UserPolicy } from "./policies/user-policy"
import { UserPresenceStatusPolicy } from "./policies/user-presence-status-policy"
import { AttachmentRepo } from "./repositories/attachment-repo"
import { ChannelMemberRepo } from "./repositories/channel-member-repo"
import { ChannelRepo } from "./repositories/channel-repo"
import { ChannelSectionRepo } from "./repositories/channel-section-repo"
import { ChannelWebhookRepo } from "./repositories/channel-webhook-repo"
import { BotCommandRepo } from "./repositories/bot-command-repo"
import { BotInstallationRepo } from "./repositories/bot-installation-repo"
import { BotRepo } from "./repositories/bot-repo"
import { GitHubSubscriptionRepo } from "./repositories/github-subscription-repo"
import { RssSubscriptionRepo } from "./repositories/rss-subscription-repo"
import { IntegrationConnectionRepo } from "./repositories/integration-connection-repo"
import { IntegrationTokenRepo } from "./repositories/integration-token-repo"
import { InvitationRepo } from "./repositories/invitation-repo"
import { MessageReactionRepo } from "./repositories/message-reaction-repo"
import { MessageRepo } from "./repositories/message-repo"
import { NotificationRepo } from "./repositories/notification-repo"
import { OrganizationMemberRepo } from "./repositories/organization-member-repo"
import { OrganizationRepo } from "./repositories/organization-repo"
import { PinnedMessageRepo } from "./repositories/pinned-message-repo"
import { TypingIndicatorRepo } from "./repositories/typing-indicator-repo"
import { AgentSessionRepo } from "./repositories/agent-session-repo"
import { SandboxRepo } from "./repositories/sandbox-repo"
import { UserCredentialRepo } from "./repositories/user-credential-repo"
import { UserPresenceStatusRepo } from "./repositories/user-presence-status-repo"
import { UserRepo } from "./repositories/user-repo"
import { AllRpcs, RpcServerLive } from "./rpc/server"
import { AuthorizationLive } from "./services/auth"
import { DatabaseLive } from "./services/database"
import { IntegrationTokenService } from "./services/integration-token-service"
import { IntegrationBotService } from "./services/integrations/integration-bot-service"
import { MockDataGenerator } from "./services/mock-data-generator"
import { OAuthProviderRegistry } from "./services/oauth"
import { RateLimiter } from "./services/rate-limiter"
import { SessionManager } from "./services/session-manager"
import { CredentialVault } from "./services/credential-vault"
import { WebhookBotService } from "./services/webhook-bot-service"
import { WorkOS } from "./services/workos"
import { WorkOSSync } from "@hazel/backend-core/services"
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
	// Sandbox-related repos
	UserCredentialRepo.Default,
	SandboxRepo.Default,
	AgentSessionRepo.Default,
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
	// Sandbox-related policies
	UserCredentialPolicy.Default,
	SandboxPolicy.Default,
	AgentSessionPolicy.Default,
)

// ResultPersistence layer for session caching (uses Redis backing)
const PersistenceLive = RedisResultPersistenceLive.pipe(Layer.provide(Redis.Default))

const MainLive = Layer.mergeAll(
	RepoLive,
	PolicyLive,
	MockDataGenerator.Default,
	WorkOS.Default,
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
	WebhookBotService.Default,
	RateLimiter.Default,
	// Credential vault for encrypting API keys
	CredentialVault.Default,
	// SessionManager.Default includes BackendAuth.Default via dependencies
	SessionManager.Default,
).pipe(Layer.provideMerge(FetchHttpClient.layer))

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
			Layer.provideMerge(WorkOS.Default),
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
	BunRuntime.runMain,
)
