/**
 * @module API client with platform-aware authentication
 * @platform shared (with platform-specific sections)
 * @description HTTP client that uses Bearer tokens for desktop and cookies for web
 */

import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiClient from "@effect/platform/HttpApiClient"
import * as HttpClient from "@effect/platform/HttpClient"
import { HazelApi } from "@hazel/backend/api"
import { Layer } from "effect"
import * as Effect from "effect/Effect"

export const CustomFetchLive = FetchHttpClient.layer.pipe(
	Layer.provideMerge(
		Layer.succeed(FetchHttpClient.Fetch, (input, init) => {
			// --- PLATFORM: DESKTOP ---
			// Bearer token authentication for Tauri desktop apps
			const token = typeof window !== "undefined" ? localStorage.getItem("hazel_access_token") : null

			if (token) {
				return fetch(input, {
					...init,
					headers: {
						...init?.headers,
						Authorization: `Bearer ${token}`,
					},
				})
			}
			// --- END PLATFORM: DESKTOP ---

			// --- PLATFORM: WEB ---
			// Cookie-based authentication for web browser
			return fetch(input, { ...init, credentials: "include" })
			// --- END PLATFORM: WEB ---
		}),
	),
)

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
	accessors: true,
	dependencies: [CustomFetchLive],
	effect: Effect.gen(function* () {
		return yield* HttpApiClient.make(HazelApi, {
			baseUrl: import.meta.env.VITE_BACKEND_URL,
			transformClient: (client) =>
				client.pipe(
					HttpClient.retry({
						times: 3,
						// Only retry server errors (5xx), not client errors (4xx) like 401/403
						while: (error) => {
							if (error._tag === "ResponseError") {
								const status = error.response.status
								// Only retry server errors (500-599) and network errors
								// Don't retry client errors (400-499) including auth errors
								return status >= 500 && status < 600
							}
							// Retry other transient errors (network issues, etc.)
							return error._tag === "RequestError"
						},
					}),
				),
		})
	}),
}) {}
