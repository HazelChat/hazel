import { FetchHttpClient, HttpApiClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { AtomHttpApi } from "@effect-atom/atom-react"
import { HazelApi } from "@hazel/backendv2/api"
import { Effect } from "effect"

export const getBackendClient = (accessToken: string) =>
	HttpApiClient.make(HazelApi, {
		baseUrl: "http://localhost:3003",
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
	httpClient: FetchHttpClient.layer,
	baseUrl: "http://localhost:3003",
}) {}
