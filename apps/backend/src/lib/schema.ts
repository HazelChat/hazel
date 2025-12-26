import { Schema } from "effect"

export const RelativeUrl = Schema.String.pipe(
	Schema.nonEmptyString(),
	Schema.startsWith("/"),
	Schema.filter((url) => !url.startsWith("//"), {
		message: () => "Protocol-relative URLs are not allowed",
	}),
)

export const AuthState = Schema.Struct({
	returnTo: RelativeUrl,
})
