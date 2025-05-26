import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiClient from "@effect/platform/HttpApiClient"
import * as HttpClient from "@effect/platform/HttpClient"
import { MakiApi } from "@maki-chat/api-schema"
import * as Effect from "effect/Effect"

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
	accessors: true,
	dependencies: [FetchHttpClient.layer],
	effect: Effect.gen(function* () {
		return {
			client: yield* HttpApiClient.make(MakiApi, {
				baseUrl: import.meta.env.VITE_BACKEND_URL,
				transformClient: (client) => client.pipe(HttpClient.retryTransient({ times: 3 })),
			}),
		}
	}),
}) {}
