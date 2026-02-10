import { HttpApiBuilder, HttpClient } from "@effect/platform"
import { GiphyApiError } from "@hazel/domain/http"
import { Config, Effect, Redacted, Schema } from "effect"
import { HazelApi } from "../api"

const GIPHY_BASE_URL = "https://api.giphy.com/v1"

const GiphyRawGif = Schema.Struct({
	id: Schema.String,
	title: Schema.String,
	url: Schema.String,
	images: Schema.Struct({
		fixed_width: Schema.Struct({
			url: Schema.String,
			width: Schema.String,
			height: Schema.String,
		}),
		fixed_width_still: Schema.Struct({
			url: Schema.String,
			width: Schema.String,
			height: Schema.String,
		}),
		original: Schema.Struct({
			url: Schema.String,
			width: Schema.String,
			height: Schema.String,
		}),
	}),
})

const GiphyRawSearchResponse = Schema.Struct({
	data: Schema.Array(GiphyRawGif),
	pagination: Schema.Struct({
		total_count: Schema.Number,
		count: Schema.Number,
		offset: Schema.Number,
	}),
})

const GiphyRawCategory = Schema.Struct({
	name: Schema.String,
	name_encoded: Schema.String,
})

const GiphyRawCategoriesResponse = Schema.Struct({
	data: Schema.Array(GiphyRawCategory),
})

const fetchGiphy = (
	httpClient: HttpClient.HttpClient,
	apiKey: string,
	path: string,
	params: Record<string, string>,
) => {
	const searchParams = new URLSearchParams({
		api_key: apiKey,
		rating: "pg-13",
		...params,
	})
	const url = `${GIPHY_BASE_URL}${path}?${searchParams.toString()}`

	return httpClient.get(url).pipe(
		Effect.flatMap((response) => {
			if (response.status >= 400) {
				return response.text.pipe(
					Effect.flatMap((body) =>
						Effect.fail(
							new GiphyApiError({
								message: `GIPHY API error: ${response.status} ${body}`,
							}),
						),
					),
				)
			}
			return response.json
		}),
		Effect.scoped,
		Effect.catchTag("RequestError", (error) =>
			Effect.fail(new GiphyApiError({ message: `GIPHY request failed: ${String(error)}` })),
		),
		Effect.catchTag("ResponseError", (error) =>
			Effect.fail(new GiphyApiError({ message: `GIPHY response error: ${String(error)}` })),
		),
	)
}

export const HttpGiphyLive = HttpApiBuilder.group(HazelApi, "giphy", (handlers) =>
	Effect.gen(function* () {
		const httpClient = yield* HttpClient.HttpClient
		const apiKeyRedacted = yield* Config.redacted("GIPHY_API_KEY").pipe(Effect.orDie)
		const apiKey = Redacted.value(apiKeyRedacted)

		return handlers
			.handle("trending", ({ urlParams }) =>
				Effect.gen(function* () {
					const raw = yield* fetchGiphy(httpClient, apiKey, "/gifs/trending", {
						offset: String(urlParams.offset),
						limit: String(urlParams.limit),
					})
					return yield* Schema.decodeUnknown(GiphyRawSearchResponse)(raw).pipe(
						Effect.mapError(
							(error) =>
								new GiphyApiError({
									message: `Failed to parse GIPHY response: ${String(error)}`,
								}),
						),
					)
				}),
			)
			.handle("search", ({ urlParams }) =>
				Effect.gen(function* () {
					const raw = yield* fetchGiphy(httpClient, apiKey, "/gifs/search", {
						q: urlParams.q,
						offset: String(urlParams.offset),
						limit: String(urlParams.limit),
					})
					return yield* Schema.decodeUnknown(GiphyRawSearchResponse)(raw).pipe(
						Effect.mapError(
							(error) =>
								new GiphyApiError({
									message: `Failed to parse GIPHY response: ${String(error)}`,
								}),
						),
					)
				}),
			)
			.handle("categories", () =>
				Effect.gen(function* () {
					const raw = yield* fetchGiphy(httpClient, apiKey, "/gifs/categories", {})
					return yield* Schema.decodeUnknown(GiphyRawCategoriesResponse)(raw).pipe(
						Effect.mapError(
							(error) =>
								new GiphyApiError({
									message: `Failed to parse GIPHY categories: ${String(error)}`,
								}),
						),
					)
				}),
			)
	}),
)
