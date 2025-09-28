import { FetchHttpClient, HttpApiClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { AtomHttpApi } from "@effect-atom/atom-react"
import { HazelApi } from "@hazel/backend/api"
import { Effect, Layer } from "effect"

const CustomFetchLive = FetchHttpClient.layer.pipe(
	Layer.provide(
		Layer.succeed(FetchHttpClient.RequestInit, {
			credentials: "include",
		}),
	),
)

export const getBackendClient = (accessToken: string) =>
	HttpApiClient.make(HazelApi, {
		baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3003",
		transformClient: (client) => {
			const pipedClient = client

			return HttpClient.mapRequest(
				pipedClient,
				HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`),
			)
		},
	}).pipe(Effect.provide(FetchHttpClient.layer))

export class HazelApiClient extends AtomHttpApi.Tag<HazelApiClient>()("HazelApiClient", {
	api: HazelApi,
	httpClient: CustomFetchLive,
	baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3003",
}) {}
