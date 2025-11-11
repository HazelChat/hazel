import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { LinkPreviewApi } from "../api"
import { KVCache } from "../cache"
import { TweetError } from "../declare"
import { TwitterApi, TwitterApiError } from "../services/twitter"

export const HttpTweetLive = HttpApiBuilder.group(LinkPreviewApi, "tweet", (handlers) =>
	handlers.handle(
		"get",
		Effect.fn(function* ({ urlParams }) {
			const tweetId = urlParams.id
			const cacheKey = `tweet:${tweetId}`
			const cache = yield* KVCache
			const twitterApi = yield* TwitterApi

			// Check cache first
			const cachedData = yield* cache
				.get<any>(cacheKey)
				.pipe(Effect.catchAll(() => Effect.succeed(null)))

			if (cachedData) {
				yield* Effect.log(`Cache hit for tweet: ${tweetId}`)
				return cachedData
			}

			yield* Effect.log(`Cache miss - fetching tweet data for ID: ${tweetId}`)

			// Fetch tweet data using Twitter service
			const tweet = yield* twitterApi.fetchTweet(tweetId).pipe(
				Effect.mapError((error) => {
					// Convert TwitterApiError to TweetError
					if (error instanceof TwitterApiError) {
						return new TweetError({
							message: error.message,
						})
					}
					return new TweetError({
						message: `Failed to fetch tweet: ${error}`,
					})
				}),
			)

			yield* Effect.log(`Successfully fetched tweet: ${tweetId}`)

			// Store in cache (don't fail request if caching fails)
			yield* cache.set(cacheKey, tweet).pipe(
				Effect.catchAll((error) => {
					const errorMessage = error instanceof Error ? error.message : String(error)
					return Effect.log(`Failed to cache tweet: ${errorMessage}`).pipe(
						Effect.andThen(Effect.succeed(undefined)),
					)
				}),
			)

			// Return the tweet data
			return tweet
		}),
	),
)
