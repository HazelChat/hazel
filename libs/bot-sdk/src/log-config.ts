/**
 * Log Configuration for Bot SDK
 *
 * Provides configurable log levels and formats for bot logging.
 */

import { Layer, Logger, LogLevel } from "effect"

/**
 * Log output format options
 */
export type LogFormat = "pretty" | "structured"

/**
 * Bot logging configuration
 */
export interface BotLogConfig {
	/**
	 * Minimum log level to output
	 * @default LogLevel.Info
	 *
	 * Log Level Guidelines:
	 *
	 * DEBUG:
	 * - Handler start/complete with timing
	 * - Queue operations (create, size updates)
	 * - Shape stream events (table, operation, eventId)
	 * - Internal state changes
	 * - SSE event parsing details
	 *
	 * INFO:
	 * - Bot authenticated
	 * - SSE connected
	 * - Command received (name only)
	 * - Message sent
	 * - Command synced
	 * - Shape stream subscription active
	 *
	 * WARNING:
	 * - Queue full (dropping events)
	 * - Schema validation failed
	 * - No handler for command
	 * - Retry attempts
	 *
	 * ERROR:
	 * - Handler failed after retries
	 * - SSE connection failed permanently
	 * - Authentication failed
	 */
	readonly level: LogLevel.LogLevel

	/**
	 * Output format
	 * - "pretty": Human-readable colored output for development
	 * - "structured": JSON output for production/log aggregation
	 * @default "pretty" in development, "structured" in production
	 */
	readonly format: LogFormat

	/**
	 * Services to enable DEBUG level for (overrides global level)
	 * Useful for debugging specific services while keeping others at INFO
	 * @example ["EventDispatcher", "SseCommandListener"]
	 */
	readonly debugServices?: readonly string[]
}

/**
 * Default log configuration
 */
export const defaultLogConfig: BotLogConfig = {
	level: LogLevel.Info,
	format: "pretty",
}

/**
 * Production log configuration
 */
export const productionLogConfig: BotLogConfig = {
	level: LogLevel.Info,
	format: "structured",
}

/**
 * Debug log configuration (all DEBUG output)
 */
export const debugLogConfig: BotLogConfig = {
	level: LogLevel.Debug,
	format: "pretty",
}

/**
 * Create a logger layer from log configuration
 */
export const createLoggerLayer = (config: BotLogConfig): Layer.Layer<never> => {
	const formatLayer = config.format === "structured" ? Logger.structured : Logger.pretty

	return Layer.mergeAll(formatLayer, Logger.minimumLogLevel(config.level))
}

/**
 * Log level from string (useful for environment variables)
 */
export const logLevelFromString = (level: string): LogLevel.LogLevel => {
	switch (level.toLowerCase()) {
		case "all":
			return LogLevel.All
		case "trace":
			return LogLevel.Trace
		case "debug":
			return LogLevel.Debug
		case "info":
			return LogLevel.Info
		case "warning":
			return LogLevel.Warning
		case "error":
			return LogLevel.Error
		case "fatal":
			return LogLevel.Fatal
		case "none":
			return LogLevel.None
		default:
			return LogLevel.Info
	}
}
