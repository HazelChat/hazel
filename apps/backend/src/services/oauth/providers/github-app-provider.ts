import { Effect } from "effect"
import type {
	GitHubAppJWTError,
	GitHubInstallationTokenError,
	InstallationToken,
} from "../../github-app-jwt-service"
import { AccountInfoError, type OAuthProvider, TokenExchangeError } from "../oauth-provider"
import type { OAuthProviderConfig, OAuthTokens } from "../provider-config"

/**
 * Service interface for GitHub App JWT operations.
 * This type matches the service returned by GitHubAppJWTService.
 */
interface GitHubAppJWTServiceInterface {
	readonly getAppSlug: () => string
	readonly buildInstallationUrl: (state: string) => URL
	readonly getInstallationToken: (
		installationId: string,
	) => Effect.Effect<InstallationToken, GitHubAppJWTError | GitHubInstallationTokenError>
}

/**
 * GitHub App Provider Implementation.
 *
 * Unlike OAuth Apps, GitHub Apps use a different flow:
 * 1. User is redirected to install the app on their org/repos
 * 2. GitHub redirects back with an `installation_id` (not a code)
 * 3. We use the installation_id to generate short-lived access tokens via JWT
 *
 * Key differences from OAuth:
 * - Authorization URL is the app installation page
 * - "Code" in callback is actually the installation_id
 * - Tokens are generated via JWT, not exchanged
 * - Tokens expire in 1 hour and must be regenerated
 *
 * @see https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
 */
export const createGitHubAppProvider = (
	config: OAuthProviderConfig,
	jwtService: GitHubAppJWTServiceInterface,
): OAuthProvider => ({
	provider: "github",
	config,

	/**
	 * Build the GitHub App installation URL.
	 * This redirects users to install the app on their account/org.
	 */
	buildAuthorizationUrl: (state: string) => Effect.succeed(jwtService.buildInstallationUrl(state)),

	/**
	 * Exchange installation ID for tokens.
	 *
	 * NOTE: For GitHub Apps, the "code" parameter is actually the installation_id
	 * passed by GitHub in the callback URL.
	 */
	exchangeCodeForTokens: (installationId: string) =>
		jwtService.getInstallationToken(installationId).pipe(
			Effect.map(
				(installationToken) =>
					({
						accessToken: installationToken.token,
						refreshToken: undefined, // GitHub Apps don't use refresh tokens
						expiresAt: installationToken.expiresAt,
						scope: undefined,
						tokenType: "Bearer",
					}) satisfies OAuthTokens,
			),
			Effect.mapError(
				(error) =>
					new TokenExchangeError({
						provider: "github",
						message: `Failed to get installation token: ${error.message}`,
						cause: error,
					}),
			),
		),

	/**
	 * Get account info from GitHub API.
	 *
	 * For GitHub Apps, we fetch the installation details to get the account name.
	 * The installation_id is stored in the connection settings.
	 */
	getAccountInfo: (accessToken: string) =>
		Effect.tryPromise({
			try: async () => {
				// First, get the authenticated installation info
				const response = await fetch("https://api.github.com/installation/repositories", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					},
				})

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(`GitHub API request failed: ${response.status} ${errorText}`)
				}

				const data = await response.json()

				// Get the owner from the first repository (all repos in an installation belong to same owner)
				const firstRepo = data.repositories?.[0]
				if (firstRepo?.owner) {
					return {
						externalAccountId: String(firstRepo.owner.id),
						externalAccountName: firstRepo.owner.login,
					}
				}

				// Fallback: try to get authenticated app info
				const appResponse = await fetch("https://api.github.com/app", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					},
				})

				if (appResponse.ok) {
					const appData = await appResponse.json()
					return {
						externalAccountId: String(appData.id),
						externalAccountName: appData.name || "GitHub App",
					}
				}

				// If we can't get account info, use placeholder
				return {
					externalAccountId: "unknown",
					externalAccountName: "GitHub",
				}
			},
			catch: (error) =>
				new AccountInfoError({
					provider: "github",
					message: `Failed to get GitHub account info: ${String(error)}`,
					cause: error,
				}),
		}),

	// GitHub Apps use JWT-based token regeneration, not refresh tokens
	// The token service handles regeneration via GitHubAppJWTService
})
