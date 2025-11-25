import { Database } from "@hazel/db"
import { Config, ConfigProvider, Effect, Layer, Redacted } from "effect"
import { type AuthenticationError, validateSession } from "./auth"
import { type BotAuthenticationError, validateBotToken } from "./bot-auth"
import { type BotTableAccessError, getBotWhereClauseForTable, validateBotTable } from "./bot-tables"
import { prepareElectricUrl, proxyElectricRequest } from "./electric-proxy"
import { getWhereClauseForTable, type TableAccessError, validateTable } from "./tables"

/**
 * Get CORS headers for response
 * Note: When using credentials, we must specify exact origin instead of "*"
 */
function getCorsHeaders(request: Request, allowedOrigin: string): HeadersInit {
	const requestOrigin = request.headers.get("Origin")

	// Only set Access-Control-Allow-Origin if the request origin matches the allowed origin
	const origin = requestOrigin === allowedOrigin ? allowedOrigin : "null"

	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization",
		"Access-Control-Allow-Credentials": "true",
		Vary: "Origin, Cookie",
	}
}

/**
 * Handle bot requests (Bearer token auth)
 */
const handleBotRequest = (request: Request, env: Env) =>
	Effect.gen(function* () {
		// Bots are server-side, allow any origin
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		}

		// Only allow GET and DELETE methods (Electric protocol)
		if (request.method !== "GET" && request.method !== "DELETE") {
			return new Response("Method not allowed", {
				status: 405,
				headers: {
					Allow: "GET, DELETE, OPTIONS",
					...corsHeaders,
				},
			})
		}

		// Validate configuration
		if (!env.ELECTRIC_URL) {
			return new Response("ELECTRIC_URL not configured", {
				status: 500,
				headers: corsHeaders,
			})
		}

		// Authenticate bot via Bearer token
		const bot = yield* validateBotToken(request)

		// Extract and validate table parameter
		const searchParams = new URL(request.url).searchParams
		const tableParam = searchParams.get("table")

		const tableValidation = validateBotTable(tableParam)
		if (!tableValidation.valid) {
			return new Response(
				JSON.stringify({
					error: tableValidation.error,
				}),
				{
					status: tableParam ? 403 : 400,
					headers: {
						"Content-Type": "application/json",
						...corsHeaders,
					},
				},
			)
		}

		// Prepare Electric URL and proxy the request
		const originUrl = prepareElectricUrl(request.url)
		originUrl.searchParams.set("table", tableValidation.table!)

		const whereClause = yield* getBotWhereClauseForTable(tableValidation.table!, bot)
		console.log("bot whereClause", whereClause)

		originUrl.searchParams.set("where", whereClause)

		// Proxy request to Electric
		const response = yield* Effect.promise(() => proxyElectricRequest(originUrl))

		// Add CORS headers to response
		const headers = new Headers(response.headers)
		for (const [key, value] of Object.entries(corsHeaders)) {
			headers.set(key, value)
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		})
	})

/**
 * Handle user requests (WorkOS session cookie auth)
 */
const handleUserRequest = (request: Request, env: Env, allowedOrigin: string) =>
	Effect.gen(function* () {
		// Validate configuration
		if (!env.ELECTRIC_URL) {
			return new Response("ELECTRIC_URL not configured", {
				status: 500,
				headers: getCorsHeaders(request, allowedOrigin),
			})
		}

		// Authenticate user - Config validation happens inside validateSession
		const user = yield* validateSession(request)

		// Extract and validate table parameter
		const searchParams = new URL(request.url).searchParams
		const tableParam = searchParams.get("table")

		const tableValidation = validateTable(tableParam)
		if (!tableValidation.valid) {
			return new Response(
				JSON.stringify({
					error: tableValidation.error,
				}),
				{
					status: tableParam ? 403 : 400,
					headers: {
						"Content-Type": "application/json",
						...getCorsHeaders(request, allowedOrigin),
					},
				},
			)
		}

		// Prepare Electric URL and proxy the request
		const originUrl = prepareElectricUrl(request.url)
		originUrl.searchParams.set("table", tableValidation.table!)

		const whereClause = yield* getWhereClauseForTable(tableValidation.table!, user)
		console.log("whereClause", whereClause)

		// // Always set where clause (no nullable check needed)
		originUrl.searchParams.set("where", whereClause)

		// Proxy request to Electric
		const response = yield* Effect.promise(() => proxyElectricRequest(originUrl))

		// Add CORS headers to response
		const headers = new Headers(response.headers)
		for (const [key, value] of Object.entries(getCorsHeaders(request, allowedOrigin))) {
			headers.set(key, value)
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		})
	})

/**
 * Main proxy handler using Effect-based flow
 * Routes requests based on path: /bot/v1/shape for bots, everything else for users
 */
const handleRequest = (request: Request, env: Env) =>
	Effect.gen(function* () {
		const allowedOrigin = env.ALLOWED_ORIGIN || "http://localhost:3000"
		const url = new URL(request.url)

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			// For bot paths, allow any origin
			if (url.pathname === "/bot/v1/shape") {
				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					},
				})
			}
			return new Response(null, {
				status: 204,
				headers: getCorsHeaders(request, allowedOrigin),
			})
		}

		// Route bot requests to dedicated handler
		if (url.pathname === "/bot/v1/shape") {
			return yield* handleBotRequest(request, env)
		}

		// Only allow GET and DELETE methods (Electric protocol)
		if (request.method !== "GET" && request.method !== "DELETE") {
			return new Response("Method not allowed", {
				status: 405,
				headers: {
					Allow: "GET, DELETE, OPTIONS",
					...getCorsHeaders(request, allowedOrigin),
				},
			})
		}

		// Handle user requests
		return yield* handleUserRequest(request, env, allowedOrigin)
	})

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const allowedOrigin = env.ALLOWED_ORIGIN || "http://localhost:3000"

		// Create Database layer
		const DatabaseLive = Layer.unwrapEffect(
			Effect.gen(function* () {
				return Database.layer({
					url: Redacted.make(env.HYPERDRIVE.connectionString),
					ssl: false,
				})
			}),
		)

		// Run Effect pipeline
		const program = handleRequest(request, env).pipe(
			Effect.provide(DatabaseLive),
			// User authentication errors
			Effect.catchTag("AuthenticationError", (error: AuthenticationError) =>
				Effect.succeed(
					new Response(
						JSON.stringify({
							error: error.message,
							detail: error.detail,
						}),
						{
							status: 401,
							headers: {
								"Content-Type": "application/json",
								...getCorsHeaders(request, allowedOrigin),
							},
						},
					),
				),
			),
			// Bot authentication errors
			Effect.catchTag("BotAuthenticationError", (error: BotAuthenticationError) =>
				Effect.succeed(
					new Response(
						JSON.stringify({
							error: error.message,
							detail: error.detail,
						}),
						{
							status: 401,
							headers: {
								"Content-Type": "application/json",
								...getCorsHeaders(request, allowedOrigin),
							},
						},
					),
				),
			),
			// User table access errors
			Effect.catchTag("TableAccessError", (error: TableAccessError) =>
				Effect.succeed(
					new Response(
						JSON.stringify({
							error: error.message,
							detail: error.detail,
							table: error.table,
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
								...getCorsHeaders(request, allowedOrigin),
							},
						},
					),
				),
			),
			// Bot table access errors
			Effect.catchTag("BotTableAccessError", (error: BotTableAccessError) =>
				Effect.succeed(
					new Response(
						JSON.stringify({
							error: error.message,
							detail: error.detail,
							table: error.table,
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
								...getCorsHeaders(request, allowedOrigin),
							},
						},
					),
				),
			),
			Effect.catchAll((error) =>
				Effect.succeed(
					new Response(
						JSON.stringify({
							error: "Internal server error",
							detail: String(error),
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
								...getCorsHeaders(request, allowedOrigin),
							},
						},
					),
				),
			),
		)

		return await Effect.runPromise(program.pipe(Effect.withConfigProvider(ConfigProvider.fromJson(env))))
	},
} satisfies ExportedHandler<Env>
