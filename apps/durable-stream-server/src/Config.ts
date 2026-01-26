/**
 * Configuration service for the durable streams server.
 */
import { Config, Context, Duration, Effect, Layer, Redacted } from "effect"

/**
 * Server configuration interface for Effect-based runtime configuration.
 */
export interface ServerConfigShape {
	readonly longPollTimeout: Duration.Duration
	readonly cursorIntervalSeconds: number
	readonly cursorEpoch: Date
	readonly producerStateTtl: Duration.Duration
}

/**
 * Auth configuration interface.
 */
export interface AuthConfigShape {
	readonly databaseUrl: Redacted.Redacted<string>
	readonly serviceToken: Redacted.Redacted<string>
	readonly authEnabled: boolean
}

/**
 * Server configuration service tag for Effect dependency injection.
 */
export class ServerConfigService extends Context.Tag(`@durable-streams/server-effect/ServerConfigService`)<
	ServerConfigService,
	ServerConfigShape
>() {
	/**
	 * Default configuration layer using environment variables with fallbacks.
	 */
	static readonly Default = Layer.effect(
		ServerConfigService,
		Effect.gen(function* () {
			const longPollTimeout = yield* Config.duration(`LONG_POLL_TIMEOUT`).pipe(
				Config.withDefault(Duration.seconds(30)),
			)
			const cursorIntervalSeconds = yield* Config.number(`CURSOR_INTERVAL_SECONDS`)
				.pipe()
				.pipe(Config.withDefault(20))
			const cursorEpochStr = yield* Config.string(`CURSOR_EPOCH`).pipe(
				Config.withDefault(`2024-10-09T00:00:00.000Z`),
			)
			const producerStateTtl = yield* Config.duration(`PRODUCER_STATE_TTL`)
				.pipe()
				.pipe(Config.withDefault(Duration.days(7)))

			return {
				longPollTimeout,
				cursorIntervalSeconds,
				cursorEpoch: new Date(cursorEpochStr),
				producerStateTtl,
			}
		}),
	)

	/**
	 * Layer with custom configuration values.
	 */
	static readonly make = (config: Partial<ServerConfigShape>) =>
		Layer.succeed(ServerConfigService, {
			longPollTimeout: config.longPollTimeout ?? Duration.seconds(30),
			cursorIntervalSeconds: config.cursorIntervalSeconds ?? 20,
			cursorEpoch: config.cursorEpoch ?? new Date(`2024-10-09T00:00:00.000Z`),
			producerStateTtl: config.producerStateTtl ?? Duration.days(7),
		})
}

/**
 * Auth configuration service tag for Effect dependency injection.
 */
export class AuthConfigService extends Context.Tag(`@durable-streams/server-effect/AuthConfigService`)<
	AuthConfigService,
	AuthConfigShape
>() {
	/**
	 * Default configuration layer using environment variables.
	 */
	static readonly Default = Layer.effect(
		AuthConfigService,
		Effect.gen(function* () {
			const databaseUrl = yield* Config.redacted(`DATABASE_URL`).pipe(
				Config.withDefault(Redacted.make(``)),
			)
			const serviceToken = yield* Config.redacted(`STREAM_SERVICE_TOKEN`).pipe(
				Config.withDefault(Redacted.make(``)),
			)
			// Auth is enabled if both DATABASE_URL and STREAM_SERVICE_TOKEN are set
			const authEnabled =
				Redacted.value(databaseUrl).length > 0 && Redacted.value(serviceToken).length > 0

			return {
				databaseUrl,
				serviceToken,
				authEnabled,
			}
		}),
	)

	/**
	 * Layer with custom configuration values.
	 */
	static readonly make = (config: Partial<AuthConfigShape>) =>
		Layer.succeed(AuthConfigService, {
			databaseUrl: config.databaseUrl ?? Redacted.make(``),
			serviceToken: config.serviceToken ?? Redacted.make(``),
			authEnabled: config.authEnabled ?? false,
		})
}
