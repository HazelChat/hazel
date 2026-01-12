import { HttpClient } from "@effect/platform"
import { Duration, Effect, Option, Schema } from "effect"

export class InvalidAvatarUrlError extends Schema.TaggedError<InvalidAvatarUrlError>()(
	"InvalidAvatarUrlError",
	{
		message: Schema.String,
		url: Schema.String,
	},
) {}

/**
 * Validates that a URL points to an accessible image via HTTP HEAD request.
 */
export const validateImageUrl = Effect.fn("validateImageUrl")((url: string) =>
	Effect.gen(function* () {
		const httpClient = yield* HttpClient.HttpClient
		const response = yield* httpClient.head(url).pipe(Effect.scoped, Effect.timeout(Duration.seconds(5)))

		if (response.status >= 400) {
			return yield* new InvalidAvatarUrlError({
				message: `Avatar URL returned ${response.status} error`,
				url,
			})
		}

		const contentType = Option.fromNullable(response.headers["content-type"])
		const isImage = Option.match(contentType, {
			onNone: () => false,
			onSome: (ct) => ct.startsWith("image/"),
		})

		if (!isImage) {
			return yield* new InvalidAvatarUrlError({
				message: "Avatar URL must point to an image",
				url,
			})
		}
	}).pipe(
		Effect.catchTag(
			"TimeoutException",
			() =>
				new InvalidAvatarUrlError({
					message: "Avatar URL took too long to respond",
					url,
				}),
		),
		Effect.catchTag(
			"RequestError",
			() =>
				new InvalidAvatarUrlError({
					message: "Avatar URL could not be reached",
					url,
				}),
		),
		Effect.catchTag(
			"ResponseError",
			(e) =>
				new InvalidAvatarUrlError({
					message: `Avatar URL returned ${e.response.status} error`,
					url,
				}),
		),
	),
)

export const AvatarUrl = Schema.String.pipe(
	Schema.pattern(/^https?:\/\/.+/i, {
		message: () => "Avatar URL must be a valid URL",
	}),
	Schema.maxLength(2048),
	Schema.filterEffect((url) =>
		validateImageUrl(url).pipe(
			Effect.map(() => true),
			Effect.catchAll((e) => Effect.succeed(e.message)),
		),
	),
).annotations({
	description: "A validated URL to an avatar image",
	title: "Avatar URL",
})

export type AvatarUrl = Schema.Schema.Type<typeof AvatarUrl>
