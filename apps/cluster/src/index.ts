import { ClusterWorkflowEngine } from "@effect/cluster"
import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform"
import { BunClusterSocket, BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { PgClient } from "@effect/sql-pg"
import { WorkflowProxyServer } from "@effect/workflow"
import {
	InvitationRepo,
	OrganizationMemberRepo,
	OrganizationRepo,
	UserRepo,
	WorkOSClient,
	WorkOSSync,
} from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { Cluster } from "@hazel/domain"
import { createTracingLayer } from "@hazel/effect-bun/Telemetry"
import { Config, Effect, Layer, Logger, Redacted } from "effect"
import { PresenceCleanupCronLayer } from "./cron/presence-cleanup-cron.ts"
import { StatusExpirationCronLayer } from "./cron/status-expiration-cron.ts"
import { UploadCleanupCronLayer } from "./cron/upload-cleanup-cron.ts"
import { WorkOSSyncCronLayer } from "./cron/workos-sync-cron.ts"
import { BotUserServiceLive } from "./services/bot-user-service.ts"
import { OpenRouterLanguageModelLayer } from "./services/openrouter-service.ts"
import { RssPollCronLayer } from "./cron/rss-poll-cron.ts"
import {
	CleanupUploadsWorkflowLayer,
	GitHubInstallationWorkflowLayer,
	GitHubWebhookWorkflowLayer,
	MessageNotificationWorkflowLayer,
	RssFeedPollWorkflowLayer,
	ThreadNamingWorkflowLayer,
} from "./workflows/index.ts"

// PostgreSQL configuration (uses existing database)
const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
	Layer.provideMerge(BunClusterSocket.layer()),
	Layer.provideMerge(
		PgClient.layerConfig({
			url: Config.redacted("EFFECT_DATABASE_URL"),
		}),
	),
)

// Database layer for Drizzle ORM (uses same credentials as PgClient)
const DatabaseLayer = Database.layer({
	url: Redacted.make(process.env.DATABASE_URL as string)!,
	ssl: !process.env.IS_DEV,
})

// OpenTelemetry tracing layer
const TracerLive = createTracingLayer("cluster")

// Health check endpoint
const HealthLive = HttpApiBuilder.group(Cluster.WorkflowApi, "health", (handlers) =>
	handlers.handle("ok", () => Effect.succeed("ok")),
)

const AllWorkflows = Layer.mergeAll(
	MessageNotificationWorkflowLayer,
	CleanupUploadsWorkflowLayer,
	GitHubInstallationWorkflowLayer,
	GitHubWebhookWorkflowLayer,
	RssFeedPollWorkflowLayer,
	ThreadNamingWorkflowLayer.pipe(Layer.provide(OpenRouterLanguageModelLayer)),
).pipe(Layer.provide(BotUserServiceLive), Layer.provide(DatabaseLayer))

// WorkOSSync dependencies layer for cron job
// Build the layer manually to ensure Database is provided to all deps
const WorkOSSyncLive = WorkOSSync.Default.pipe(
	Layer.provide(WorkOSClient.Default),
	Layer.provide(UserRepo.Default),
	Layer.provide(OrganizationRepo.Default),
	Layer.provide(OrganizationMemberRepo.Default),
	Layer.provide(InvitationRepo.Default),
	Layer.provide(DatabaseLayer),
)

// Cron jobs layer - WorkflowEngineLayer provides Sharding which ClusterCron requires
const AllCronJobs = Layer.mergeAll(
	WorkOSSyncCronLayer.pipe(Layer.provide(WorkOSSyncLive)),
	PresenceCleanupCronLayer.pipe(Layer.provide(DatabaseLayer)),
	StatusExpirationCronLayer.pipe(Layer.provide(DatabaseLayer)),
	UploadCleanupCronLayer.pipe(Layer.provide(DatabaseLayer)),
	RssPollCronLayer.pipe(Layer.provide(DatabaseLayer)),
).pipe(Layer.provide(WorkflowEngineLayer))

// Workflow API implementation
const WorkflowApiLive = HttpApiBuilder.api(Cluster.WorkflowApi).pipe(
	Layer.provide(WorkflowProxyServer.layerHttpApi(Cluster.WorkflowApi, "workflows", Cluster.workflows)),
	Layer.provide(HealthLive),
	HttpServer.withLogAddress,
)

// Main server layer with CORS enabled
const ServerLayer = HttpApiBuilder.serve(
	HttpMiddleware.cors({
		allowedOrigins: ["http://localhost:3000", "https://app.hazel.sh"],
		credentials: true,
	}),
).pipe(
	Layer.provide(WorkflowApiLive),
	Layer.provide(AllWorkflows),
	Layer.provide(AllCronJobs),
	Layer.provide(Logger.pretty),
	Layer.provide(
		BunHttpServer.layerConfig(
			Config.all({
				hostname: Config.succeed("::"),
				port: Config.number("PORT").pipe(Config.withDefault(3020)),
				idleTimeout: Config.succeed(120),
			}),
		),
	),
)

Layer.launch(ServerLayer.pipe(Layer.provide(WorkflowEngineLayer), Layer.provide(TracerLive))).pipe(
	BunRuntime.runMain,
)
