import { FetchHttpClient, HttpApiClient, HttpClient } from "@effect/platform/index"
import { MakiApi } from "@maki-chat/api-schema"
import { Effect } from "effect/index"

const apiClient = HttpApiClient.make(MakiApi, {
	baseUrl: "http://localhost:8787",

	transformClient: (client) => client.pipe(HttpClient.tapRequest(Effect.logDebug)),
})

const test = Effect.gen(function* () {
	const client = yield* apiClient

	const formData = new FormData()
	// formData.append("files", new File(["test"], "test.txt"))
	formData.append("name", "test")

	const res = yield* client.Root.upload({
		payload: formData,
	})
	console.log(res)
}).pipe(Effect.provide(FetchHttpClient.layer))

await Effect.runPromise(test)
