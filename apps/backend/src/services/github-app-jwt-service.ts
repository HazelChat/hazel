import { createPrivateKey } from "node:crypto"
import { Config, Data, Effect, Redacted } from "effect"
import { SignJWT } from "jose"

/**
 * Error when JWT generation fails.
 */
export class GitHubAppJWTError extends Data.TaggedError("GitHubAppJWTError")<{
	readonly message: string
	readonly cause?: unknown
}> {}

/**
 * Error when installation token generation fails.
 */
export class GitHubInstallationTokenError extends Data.TaggedError("GitHubInstallationTokenError")<{
	readonly installationId: string
	readonly message: string
	readonly cause?: unknown
}> {}

/**
 * GitHub App configuration loaded from environment.
 */
export interface GitHubAppConfig {
	readonly appId: string
	readonly appSlug: string
	readonly privateKey: string // PEM format (decoded from base64)
}

/**
 * Installation access token response from GitHub.
 */
export interface InstallationToken {
	readonly token: string
	readonly expiresAt: Date
}

/**
 * Load GitHub App configuration from environment variables.
 *
 * Required env vars:
 * - GITHUB_APP_ID: The numeric App ID
 * - GITHUB_APP_SLUG: The app slug (from URL)
 * - GITHUB_APP_PRIVATE_KEY: Base64-encoded PEM private key
 */
export const loadGitHubAppConfig = Effect.gen(function* () {
	const appId = yield* Config.string("GITHUB_APP_ID")
	const appSlug = yield* Config.string("GITHUB_APP_SLUG")
	const privateKeyBase64 = yield* Config.redacted("GITHUB_APP_PRIVATE_KEY")

	// Decode the base64 private key
	const privateKey = Buffer.from(Redacted.value(privateKeyBase64), "base64").toString("utf-8")

	return {
		appId,
		appSlug,
		privateKey,
	} satisfies GitHubAppConfig
})

/**
 * Generate a JWT for authenticating as the GitHub App.
 *
 * The JWT is used to request installation access tokens.
 * It has a short TTL (10 minutes max per GitHub's requirements).
 *
 * @see https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
 */
export const generateAppJWT = (
	appId: string,
	privateKeyPem: string,
): Effect.Effect<string, GitHubAppJWTError> =>
	Effect.tryPromise({
		try: async () => {
			const now = Math.floor(Date.now() / 1000)

			// Import the private key for signing
			// Use Node's createPrivateKey which handles both PKCS#1 (RSA PRIVATE KEY)
			// and PKCS#8 (PRIVATE KEY) formats - GitHub generates PKCS#1 keys
			const privateKey = createPrivateKey(privateKeyPem)

			// Create and sign the JWT
			const jwt = await new SignJWT({})
				.setProtectedHeader({ alg: "RS256" })
				.setIssuedAt(now - 60) // 60 seconds in the past to allow for clock drift
				.setExpirationTime(now + 600) // 10 minutes from now (max allowed by GitHub)
				.setIssuer(appId)
				.sign(privateKey)

			return jwt
		},
		catch: (error) =>
			new GitHubAppJWTError({
				message: `Failed to generate GitHub App JWT: ${String(error)}`,
				cause: error,
			}),
	})

/**
 * Generate an installation access token using the App JWT.
 *
 * This token is used to make API calls on behalf of a specific installation.
 * Tokens expire after 1 hour.
 *
 * @see https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app
 */
export const generateInstallationToken = (
	installationId: string,
	appJwt: string,
): Effect.Effect<InstallationToken, GitHubInstallationTokenError> =>
	Effect.tryPromise({
		try: async () => {
			const response = await fetch(
				`https://api.github.com/app/installations/${installationId}/access_tokens`,
				{
					method: "POST",
					headers: {
						Accept: "application/vnd.github+json",
						Authorization: `Bearer ${appJwt}`,
						"X-GitHub-Api-Version": "2022-11-28",
					},
				},
			)

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`GitHub API error: ${response.status} ${errorText}`)
			}

			const data = await response.json()

			return {
				token: data.token,
				expiresAt: new Date(data.expires_at),
			} satisfies InstallationToken
		},
		catch: (error) =>
			new GitHubInstallationTokenError({
				installationId,
				message: `Failed to generate installation token: ${String(error)}`,
				cause: error,
			}),
	})

/**
 * GitHub App JWT Service.
 *
 * Provides methods for generating GitHub App JWTs and installation access tokens.
 *
 * ## Usage
 *
 * ```typescript
 * const jwtService = yield* GitHubAppJWTService
 *
 * // Generate an installation token for making API calls
 * const token = yield* jwtService.getInstallationToken(installationId)
 * // token.token is the access token
 * // token.expiresAt is when it expires (1 hour from now)
 * ```
 */
export class GitHubAppJWTService extends Effect.Service<GitHubAppJWTService>()("GitHubAppJWTService", {
	accessors: true,
	effect: Effect.gen(function* () {
		// Load config once at service initialization
		// Use orDie since missing config is a fatal startup error
		const config = yield* loadGitHubAppConfig.pipe(Effect.orDie)

		/**
		 * Get the app slug for building installation URLs.
		 */
		const getAppSlug = (): string => config.appSlug

		/**
		 * Build the installation URL for redirecting users.
		 */
		const buildInstallationUrl = (state: string): URL => {
			// Use select_target to let users choose which org/account to install on
			const url = new URL(`https://github.com/apps/${config.appSlug}/installations/select_target`)
			url.searchParams.set("state", state)
			return url
		}

		/**
		 * Generate a fresh installation access token.
		 */
		const getInstallationToken = (
			installationId: string,
		): Effect.Effect<InstallationToken, GitHubAppJWTError | GitHubInstallationTokenError> =>
			Effect.gen(function* () {
				// Generate a fresh JWT for this request
				const jwt = yield* generateAppJWT(config.appId, config.privateKey)

				// Exchange JWT for installation token
				const token = yield* generateInstallationToken(installationId, jwt)

				return token
			})

		return {
			getAppSlug,
			buildInstallationUrl,
			getInstallationToken,
		}
	}),
}) {}
