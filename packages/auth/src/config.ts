import { Config, Effect, Layer, Redacted } from "effect"

/**
 * Configuration for auth services.
 * Reads WorkOS credentials from environment variables.
 */
export interface AuthConfigShape {
	/** WorkOS API key */
	readonly workosApiKey: string
	/** WorkOS client ID */
	readonly workosClientId: string
	/** Password for sealing/unsealing WorkOS session cookies */
	readonly workosPasswordCookie: Redacted.Redacted<string>
}

/**
 * Auth configuration service.
 * Provides WorkOS credentials from environment variables.
 */
export class AuthConfig extends Effect.Service<AuthConfig>()("@hazel/auth/AuthConfig", {
	accessors: true,
	effect: Effect.gen(function* () {
		const workosApiKey = yield* Config.string("WORKOS_API_KEY")
		const workosClientId = yield* Config.string("WORKOS_CLIENT_ID")
		const workosPasswordCookie = yield* Config.redacted("WORKOS_COOKIE_PASSWORD")

		return {
			workosApiKey,
			workosClientId,
			workosPasswordCookie,
		} satisfies AuthConfigShape
	}),
}) {
	static Test = Layer.mock(this, {
		_tag: "@hazel/auth/AuthConfig",
		workosApiKey: "sk_test_123",
		workosClientId: "client_test_123",
		workosPasswordCookie: Redacted.make("test-cookie-password-32chars-min"),
	})
}
