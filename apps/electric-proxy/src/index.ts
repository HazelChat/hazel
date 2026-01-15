import { BunRuntime } from "@effect/platform-bun"
import { ProxyAuth } from "@hazel/auth/proxy"
import { Database } from "@hazel/db"
import { Effect, Layer, Logger, Runtime } from "effect"
import { validateBotToken } from "./auth/bot-auth"
import { validateSession } from "./auth/user-auth"
import {
	type AccessContextCacheService,
	AccessContextCacheService as AccessContextCache,
	RedisPersistenceLive,
} from "./cache"
import { ProxyConfigService } from "./config"
import { TracerLive } from "./observability/tracer"
import { type ElectricProxyError, prepareElectricUrl, proxyElectricRequest } from "./proxy/electric-client"
import { type BotTableAccessError, getBotWhereClauseForTable, validateBotTable } from "./tables/bot-tables"
import { getWhereClauseForTable, type TableAccessError, validateTable } from "./tables/user-tables"
import { applyWhereToElectricUrl } from "./tables/where-clause-builder"

// =============================================================================
// CORS HELPERS
// =============================================================================

/**
 * Check if an origin is allowed for user flow
 * - Configured ALLOWED_ORIGIN (e.g., https://app.hazel.chat or http://localhost:3000)
 * - tauri://localhost for Tauri desktop apps (Tauri 1.x)
 * - http://tauri.localhost for Tauri desktop apps (Tauri 2.x)
 */
function isAllowedOrigin(origin: string | null, allowedOrigin: string): boolean {
	if (!origin) return false
	return origin === allowedOrigin || origin === "tauri://localhost" || origin === "http://tauri.localhost"
}

/**
 * Get CORS headers for user flow response
 * Note: When using credentials, we must specify exact origin instead of "*"
 */
function getUserCorsHeaders(allowedOrigin: string, requestOrigin: string | null): Record<string, string> {
	// Echo back the origin if it's allowed, otherwise return "null"
	const origin = isAllowedOrigin(requestOrigin, allowedOrigin) ? requestOrigin! : "null"
	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization",
		"Access-Control-Allow-Credentials": "true",
		Vary: "Origin, Cookie",
	}
}

const BOT_CORS_HEADERS: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// =============================================================================
// USER FLOW HANDLER
// =============================================================================

const handleUserRequest = (request: Request) =>
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		const allowedOrigin = config.allowedOrigin
		const requestOrigin = request.headers.get("Origin")
		const corsHeaders = getUserCorsHeaders(allowedOrigin, requestOrigin)

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders })
		}

		// Method check
		if (request.method !== "GET" && request.method !== "DELETE") {
			return new Response("Method not allowed", {
				status: 405,
				headers: { Allow: "GET, DELETE, OPTIONS", ...corsHeaders },
			})
		}

		// Authenticate user
		const user = yield* validateSession(request)

		// Extract and validate table parameter
		const url = new URL(request.url)
		const tableParam = url.searchParams.get("table")
		const tableValidation = validateTable(tableParam)

		if (!tableValidation.valid) {
			return new Response(JSON.stringify({ error: tableValidation.error }), {
				status: tableParam ? 403 : 400,
				headers: { "Content-Type": "application/json", ...corsHeaders },
			})
		}

		// Prepare Electric URL
		const originUrl = yield* prepareElectricUrl(request.url)
		originUrl.searchParams.set("table", tableValidation.table!)

		// Generate WHERE clause
		const whereResult = yield* getWhereClauseForTable(tableValidation.table!, user)
		yield* Effect.log("Generated WHERE clause", { table: tableValidation.table, whereResult })
		applyWhereToElectricUrl(originUrl, whereResult)

		// Proxy request to Electric
		const response = yield* proxyElectricRequest(originUrl)

		// Add CORS headers to response
		const headers = new Headers(response.headers)
		for (const [key, value] of Object.entries(corsHeaders)) {
			headers.set(key, value)
		}

		// If session was refreshed, set the new cookie
		if (user.refreshedSession) {
			yield* Effect.logDebug("Setting refreshed session cookie in response")
			const secure = !config.isDev
			headers.set(
				"Set-Cookie",
				`workos-session=${user.refreshedSession}; Domain=${config.workosCookieDomain}; Path=/; ${secure ? "Secure; " : ""}SameSite=None; HttpOnly`,
			)
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		})
	}).pipe(
		// Error handling
		Effect.catchTag("ProxyAuthenticationError", (error) =>
			Effect.gen(function* () {
				const config = yield* ProxyConfigService
				const requestOrigin = request.headers.get("Origin")
				yield* Effect.logInfo("Authentication failed", { error: error.message, detail: error.detail })
				return new Response(
					JSON.stringify({
						error: error.message,
						detail: error.detail,
						timestamp: new Date().toISOString(),
						hint: "Check if session cookie is present and valid",
					}),
					{
						status: 401,
						headers: {
							"Content-Type": "application/json",
							...getUserCorsHeaders(config.allowedOrigin, requestOrigin),
						},
					},
				)
			}),
		),
		Effect.catchTag("AccessContextLookupError", (error) =>
			Effect.gen(function* () {
				const config = yield* ProxyConfigService
				const requestOrigin = request.headers.get("Origin")
				yield* Effect.logError("Access context lookup failed", {
					error: error.message,
					entityId: error.entityId,
					entityType: error.entityType,
				})
				return new Response(
					JSON.stringify({
						error: error.message,
						entityId: error.entityId,
						entityType: error.entityType,
					}),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							...getUserCorsHeaders(config.allowedOrigin, requestOrigin),
						},
					},
				)
			}),
		),
		Effect.catchTag("TableAccessError", (error: TableAccessError) =>
			Effect.gen(function* () {
				const config = yield* ProxyConfigService
				const requestOrigin = request.headers.get("Origin")
				yield* Effect.logError("Table access error", { error: error.message, table: error.table })
				return new Response(
					JSON.stringify({ error: error.message, detail: error.detail, table: error.table }),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							...getUserCorsHeaders(config.allowedOrigin, requestOrigin),
						},
					},
				)
			}),
		),
		Effect.catchTag("ElectricProxyError", (error: ElectricProxyError) =>
			Effect.gen(function* () {
				const config = yield* ProxyConfigService
				const requestOrigin = request.headers.get("Origin")
				yield* Effect.logError("Electric proxy error", { error: error.message })
				return new Response(JSON.stringify({ error: error.message, detail: error.detail }), {
					status: 502,
					headers: {
						"Content-Type": "application/json",
						...getUserCorsHeaders(config.allowedOrigin, requestOrigin),
					},
				})
			}),
		),
		Effect.catchAll((error) =>
			Effect.gen(function* () {
				const config = yield* ProxyConfigService
				const requestOrigin = request.headers.get("Origin")
				yield* Effect.logError("Unexpected error in user flow", { error: String(error) })
				return new Response(
					JSON.stringify({ error: "Internal server error", detail: String(error) }),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							...getUserCorsHeaders(config.allowedOrigin, requestOrigin),
						},
					},
				)
			}),
		),
	)

// =============================================================================
// BOT FLOW HANDLER
// =============================================================================

const handleBotRequest = (request: Request) =>
	Effect.gen(function* () {
		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: BOT_CORS_HEADERS })
		}

		// Method check
		if (request.method !== "GET" && request.method !== "DELETE") {
			return new Response("Method not allowed", {
				status: 405,
				headers: { Allow: "GET, DELETE, OPTIONS", ...BOT_CORS_HEADERS },
			})
		}

		// Authenticate bot
		const bot = yield* validateBotToken(request)

		// Extract and validate table parameter
		const url = new URL(request.url)
		const tableParam = url.searchParams.get("table")
		const tableValidation = validateBotTable(tableParam)

		if (!tableValidation.valid) {
			return new Response(JSON.stringify({ error: tableValidation.error }), {
				status: tableParam ? 403 : 400,
				headers: { "Content-Type": "application/json", ...BOT_CORS_HEADERS },
			})
		}

		// Prepare Electric URL
		const originUrl = yield* prepareElectricUrl(request.url)
		originUrl.searchParams.set("table", tableValidation.table!)

		// Generate WHERE clause
		const whereResult = yield* getBotWhereClauseForTable(tableValidation.table!, bot)
		yield* Effect.log("Generated bot WHERE clause", { table: tableValidation.table, whereResult })
		applyWhereToElectricUrl(originUrl, whereResult)

		// Proxy request to Electric
		const response = yield* proxyElectricRequest(originUrl)

		// Add CORS headers to response
		const headers = new Headers(response.headers)
		for (const [key, value] of Object.entries(BOT_CORS_HEADERS)) {
			headers.set(key, value)
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		})
	}).pipe(
		// Error handling
		Effect.catchTag("BotAuthenticationError", (error) =>
			Effect.gen(function* () {
				yield* Effect.logInfo("Bot authentication failed", {
					error: error.message,
					detail: error.detail,
				})
				return new Response(
					JSON.stringify({
						error: error.message,
						detail: error.detail,
						timestamp: new Date().toISOString(),
						hint: "Check if Authorization header contains valid Bearer token",
					}),
					{
						status: 401,
						headers: { "Content-Type": "application/json", ...BOT_CORS_HEADERS },
					},
				)
			}),
		),
		Effect.catchTag("AccessContextLookupError", (error) =>
			Effect.gen(function* () {
				yield* Effect.logError("Bot access context lookup failed", {
					error: error.message,
					entityId: error.entityId,
					entityType: error.entityType,
				})
				return new Response(
					JSON.stringify({
						error: error.message,
						entityId: error.entityId,
						entityType: error.entityType,
					}),
					{ status: 500, headers: { "Content-Type": "application/json", ...BOT_CORS_HEADERS } },
				)
			}),
		),
		Effect.catchTag("BotTableAccessError", (error: BotTableAccessError) =>
			Effect.gen(function* () {
				yield* Effect.logError("Bot table access error", { error: error.message, table: error.table })
				return new Response(
					JSON.stringify({ error: error.message, detail: error.detail, table: error.table }),
					{ status: 500, headers: { "Content-Type": "application/json", ...BOT_CORS_HEADERS } },
				)
			}),
		),
		Effect.catchTag("ElectricProxyError", (error: ElectricProxyError) =>
			Effect.gen(function* () {
				yield* Effect.logError("Electric proxy error (bot)", { error: error.message })
				return new Response(JSON.stringify({ error: error.message, detail: error.detail }), {
					status: 502,
					headers: { "Content-Type": "application/json", ...BOT_CORS_HEADERS },
				})
			}),
		),
		Effect.catchAll((error) =>
			Effect.gen(function* () {
				yield* Effect.logError("Unexpected error in bot flow", { error: String(error) })
				return new Response(
					JSON.stringify({ error: "Internal server error", detail: String(error) }),
					{
						status: 500,
						headers: { "Content-Type": "application/json", ...BOT_CORS_HEADERS },
					},
				)
			}),
		),
	)

// =============================================================================
// LAYERS
// =============================================================================

const DatabaseLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		yield* Effect.log("Connecting to database", { isDev: config.isDev })
		return Database.layer({
			url: config.databaseUrl,
			ssl: !config.isDev,
		})
	}),
)

const LoggerLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		return config.isDev ? Logger.pretty : Logger.structured
	}),
).pipe(Layer.provide(ProxyConfigService.Default))

// Cache layer: AccessContextCache requires ResultPersistence and Database
const CacheLive = AccessContextCache.Default.pipe(
	Layer.provide(RedisPersistenceLive),
	Layer.provide(DatabaseLive),
	Layer.provide(ProxyConfigService.Default),
)

// ProxyAuth layer requires ResultPersistence for session caching and Database for user lookup
// ProxyAuth.Default includes SessionValidator.Default via dependencies
const ProxyAuthLive = ProxyAuth.Default.pipe(
	Layer.provide(RedisPersistenceLive),
	Layer.provide(DatabaseLive),
	Layer.provide(ProxyConfigService.Default),
)

const MainLive = DatabaseLive.pipe(
	Layer.provideMerge(ProxyConfigService.Default),
	Layer.provideMerge(LoggerLive),
	Layer.provideMerge(CacheLive),
	Layer.provideMerge(TracerLive),
	Layer.provideMerge(ProxyAuthLive),
)

// =============================================================================
// SERVER
// =============================================================================

const ServerLive = Layer.scopedDiscard(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService

		yield* Effect.log("Starting Electric Proxy (Bun)", {
			port: config.port,
			electricUrl: config.electricUrl,
			allowedOrigin: config.allowedOrigin,
		})

		const runtime = yield* Effect.runtime<
			ProxyConfigService | Database.Database | AccessContextCacheService | ProxyAuth
		>()

		yield* Effect.acquireRelease(
			Effect.sync(() =>
				Bun.serve({
					port: config.port,
					hostname: "::",
					idleTimeout: 120,
					routes: {
						"/health": new Response("OK"), // Static response - zero allocation
						"/v1/shape": (req) => Runtime.runPromise(runtime)(handleUserRequest(req)),
						"/bot/v1/shape": (req) => Runtime.runPromise(runtime)(handleBotRequest(req)),
					},
					fetch() {
						return new Response("Not Found", { status: 404 })
					},
				}),
			),
			(server) =>
				Effect.gen(function* () {
					yield* Effect.log("Shutting down server...")
					server.stop(true)
				}),
		)

		yield* Effect.log(`Server listening on port ${config.port}`)
	}),
)

Layer.launch(ServerLive.pipe(Layer.provide(MainLive))).pipe(BunRuntime.runMain)
