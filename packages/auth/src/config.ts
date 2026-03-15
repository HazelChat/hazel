import { ServiceMap, Config, Effect, Layer } from "effect"

/**
 * Configuration for auth services.
 * Reads WorkOS credentials from environment variables.
 */
export interface AuthConfigShape {
	/** WorkOS API key */
	readonly workosApiKey: string
	/** WorkOS client ID */
	readonly workosClientId: string
}

/**
 * Auth configuration service.
 * Provides WorkOS credentials from environment variables.
 */
export class AuthConfig extends ServiceMap.Service<AuthConfig>()("@hazel/auth/AuthConfig", {
	make: Effect.gen(function* () {
		const workosApiKey = yield* Config.string("WORKOS_API_KEY")
		const workosClientId = yield* Config.string("WORKOS_CLIENT_ID")

		return {
			workosApiKey,
			workosClientId,
		} satisfies AuthConfigShape
	}),
}) {
	static Test = Layer.mock(this, {
		_tag: "@hazel/auth/AuthConfig",
		workosApiKey: "sk_test_123",
		workosClientId: "client_test_123",
	})
}
