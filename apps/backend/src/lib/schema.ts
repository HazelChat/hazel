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

// Auth state for desktop OAuth flow with connection info
export const DesktopAuthState = Schema.Struct({
	returnTo: RelativeUrl,
	desktopPort: Schema.Number,
	desktopNonce: Schema.String,
})
