/**
 * Electric SQL Proxy - Cloudflare Worker
 * Based on: https://github.com/electric-sql/electric/tree/main/examples/tanstack-db-web-starter
 */

// Electric protocol query parameters that should be forwarded
const ELECTRIC_PROTOCOL_QUERY_PARAMS = [
	"offset",
	"handle",
	"live",
	"shape_id",
	"cursor",
	"table",
	"where",
	"columns",
	"replica",
] as const

interface Env {
	ELECTRIC_URL: string
	ELECTRIC_SOURCE_ID?: string
	ELECTRIC_SOURCE_SECRET?: string
}

/**
 * Prepare the Electric URL from the incoming request URL
 * Copies Electric protocol params and adds auth if configured
 */
function prepareElectricUrl(requestUrl: string, electricBaseUrl: string, env: Env): URL {
	const url = new URL(requestUrl)
	const originUrl = new URL(`${electricBaseUrl}/v1/shape`)

	// Copy Electric protocol query parameters
	url.searchParams.forEach((value, key) => {
		if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key as any)) {
			originUrl.searchParams.set(key, value)
		}
	})

	// Add authentication if configured
	if (env.ELECTRIC_SOURCE_ID && env.ELECTRIC_SOURCE_SECRET) {
		originUrl.searchParams.set("source_id", env.ELECTRIC_SOURCE_ID)
		originUrl.searchParams.set("secret", env.ELECTRIC_SOURCE_SECRET)
	}

	return originUrl
}

/**
 * Proxy the request to Electric and return the response
 * Handles streaming responses and header manipulation
 */
async function proxyElectricRequest(originUrl: URL, method: string): Promise<Response> {
	const response = await fetch(originUrl.toString(), {
		method,
		// Preserve other fetch options if needed
		headers: {
			"Content-Type": "application/json",
		},
	})

	// Clone headers and remove compression-related headers
	// This ensures proper streaming to the client
	const headers = new Headers(response.headers)
	headers.delete("content-encoding")
	headers.delete("content-length")
	headers.set("vary", "cookie")

	// Add CORS headers for development
	headers.set("Access-Control-Allow-Origin", "*")
	headers.set("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS")
	headers.set("Access-Control-Allow-Headers", "*")

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	})
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "*",
				},
			})
		}

		// Only allow GET and DELETE methods (Electric protocol)
		if (request.method !== "GET" && request.method !== "DELETE") {
			return new Response("Method not allowed", {
				status: 405,
				headers: {
					Allow: "GET, DELETE, OPTIONS",
				},
			})
		}

		try {
			// Get Electric URL from environment
			const electricUrl = env.ELECTRIC_URL
			if (!electricUrl) {
				return new Response("ELECTRIC_URL not configured", { status: 500 })
			}

			// Prepare the Electric URL with proper params
			const originUrl = prepareElectricUrl(request.url, electricUrl, env)

			// Proxy the request to Electric
			return await proxyElectricRequest(originUrl, request.method)
		} catch (error) {
			console.error("Proxy error:", error)
			return new Response(`Proxy error: ${error instanceof Error ? error.message : "Unknown error"}`, {
				status: 500,
			})
		}
	},
} satisfies ExportedHandler<Env>
