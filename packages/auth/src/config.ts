import { ServiceMap, Config, Effect, Layer } from "effect"

/**
 * Configuration for auth services.
 * Carries both WorkOS and Clerk credentials during the migration window;
 * WorkOS keys will be removed once the swap completes.
 *
 * Clerk keys are optional so services that only verify WorkOS JWTs
 * (e.g., electric-proxy) can boot without them set. Services that need
 * a Clerk key (ClerkClient, BackendAuth.authenticateWithClerkBearer)
 * fail at their own call site with a clearer error.
 */
export interface AuthConfigShape {
	/** WorkOS API key */
	readonly workosApiKey: string
	/** WorkOS client ID */
	readonly workosClientId: string
	/** Clerk secret key (sk_live_* / sk_test_*) — empty string if unset */
	readonly clerkSecretKey: string
	/** Clerk publishable key (pk_live_* / pk_test_*) — empty string if unset */
	readonly clerkPublishableKey: string
}

export class AuthConfig extends ServiceMap.Service<AuthConfig>()("@hazel/auth/AuthConfig", {
	make: Effect.gen(function* () {
		const workosApiKey = yield* Config.string("WORKOS_API_KEY")
		const workosClientId = yield* Config.string("WORKOS_CLIENT_ID")
		const clerkSecretKey = yield* Config.string("CLERK_SECRET_KEY").pipe(Config.withDefault(""))
		const clerkPublishableKey = yield* Config.string("CLERK_PUBLISHABLE_KEY").pipe(
			Config.withDefault(""),
		)

		return {
			workosApiKey,
			workosClientId,
			clerkSecretKey,
			clerkPublishableKey,
		} satisfies AuthConfigShape
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)

	static Test = Layer.mock(this, {
		workosApiKey: "sk_test_123",
		workosClientId: "client_test_123",
		clerkSecretKey: "sk_test_clerk_123",
		clerkPublishableKey: "pk_test_clerk_123",
	})
}
