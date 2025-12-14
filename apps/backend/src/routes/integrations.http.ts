import { HttpApiBuilder, HttpServerResponse } from "@effect/platform"
import {
	CurrentUser,
	InternalServerError,
	type OrganizationId,
	UnauthorizedError,
	type UserId,
	withSystemActor,
} from "@hazel/domain"
import {
	ConnectionStatusResponse,
	IntegrationNotConnectedError,
	InvalidOAuthStateError,
} from "@hazel/domain/http"
import { Config, Effect, Option, Schema } from "effect"
import { HazelApi } from "../api"
import { IntegrationConnectionRepo } from "../repositories/integration-connection-repo"
import { OrganizationRepo } from "../repositories/organization-repo"
import { IntegrationTokenService } from "../services/integration-token-service"
import { OAuthProviderRegistry } from "../services/oauth"

/**
 * OAuth state schema - encoded in the state parameter during OAuth flow.
 * Contains context needed to complete the flow after callback.
 */
const OAuthState = Schema.Struct({
	organizationId: Schema.String,
	userId: Schema.String,
	/** Full URL to redirect after OAuth completes (e.g., http://localhost:3000/org/settings/integrations) */
	returnTo: Schema.String,
	/** Environment that initiated the OAuth flow. Used to redirect back to localhost for local dev. */
	environment: Schema.optional(Schema.Literal("local", "production")),
})

export const HttpIntegrationLive = HttpApiBuilder.group(HazelApi, "integrations", (handlers) =>
	handlers
		/**
		 * Get OAuth authorization URL for a provider.
		 * Redirects the user to the provider's OAuth consent page.
		 */
		.handle("getOAuthUrl", ({ path }) =>
			Effect.gen(function* () {
				const currentUser = yield* CurrentUser.Context
				const { orgId, provider } = path

				// Get the OAuth provider from registry
				const registry = yield* OAuthProviderRegistry
				const oauthProvider = yield* registry.getProvider(provider).pipe(
					Effect.mapError(
						(error) =>
							new InternalServerError({
								message: `Provider not available: ${error._tag}`,
								detail: String(error),
							}),
					),
				)

				const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

				// Get org slug for redirect URL
				const orgRepo = yield* OrganizationRepo
				const orgOption = yield* orgRepo.findById(orgId).pipe(
					withSystemActor,
					Effect.mapError(
						(error) =>
							new InternalServerError({
								message: "Failed to fetch organization",
								detail: String(error),
							}),
					),
				)
				const org = yield* Option.match(orgOption, {
					onNone: () =>
						Effect.fail(
							new UnauthorizedError({
								message: "Organization not found",
								detail: `Could not find organization ${orgId}`,
							}),
						),
					onSome: Effect.succeed,
				})

				// Determine environment from NODE_ENV config
				// Local dev uses "local" so production can redirect callbacks back to localhost
				const nodeEnv = yield* Config.string("NODE_ENV").pipe(
					Config.withDefault("production"),
					Effect.orDie,
				)
				const environment = nodeEnv === "development" ? "local" : "production"

				// Encode state with return URL, context, and environment
				const state = encodeURIComponent(
					JSON.stringify({
						organizationId: orgId,
						userId: currentUser.id,
						returnTo: `${frontendUrl}/${org.slug}/settings/integrations`,
						environment,
					}),
				)

				// Build authorization URL using the provider
				const authorizationUrl = yield* oauthProvider.buildAuthorizationUrl(state)

				return { authorizationUrl: authorizationUrl.toString() }
			}),
		)

		/**
		 * Handle OAuth callback from provider.
		 * Exchanges authorization code for tokens and stores the connection.
		 *
		 * For GitHub App: Receives `installation_id` instead of `code`.
		 * For standard OAuth: Receives `code` authorization code.
		 */
		.handle("oauthCallback", ({ path, urlParams }) =>
			Effect.gen(function* () {
				const { provider } = path
				const { code, state: encodedState, installation_id, setup_action } = urlParams

				// Handle update callbacks that don't have state (GitHub sends these when permissions change)
				if (!encodedState && installation_id && setup_action === "update") {
					const connectionRepo = yield* IntegrationConnectionRepo
					const orgRepo = yield* OrganizationRepo
					const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

					// Look up the connection by installation ID
					const connectionOption = yield* connectionRepo
						.findByGitHubInstallationId(installation_id)
						.pipe(withSystemActor)

					if (Option.isNone(connectionOption)) {
						// No connection found - redirect to root
						yield* Effect.logWarning("GitHub update callback for unknown installation", {
							installationId: installation_id,
						})
						return HttpServerResponse.redirect(frontendUrl)
					}

					const connection = connectionOption.value

					// Get the organization to find its slug
					const orgOption = yield* orgRepo.findById(connection.organizationId).pipe(
						withSystemActor,
						Effect.catchTag("DatabaseError", () => Effect.succeed(Option.none())),
					)

					if (Option.isNone(orgOption)) {
						yield* Effect.logWarning("GitHub update callback: organization not found", {
							organizationId: connection.organizationId,
						})
						return HttpServerResponse.redirect(frontendUrl)
					}

					const org = orgOption.value

					// Redirect to the organization's GitHub integration settings
					return HttpServerResponse.redirect(
						`${frontendUrl}/${org.slug}/settings/integrations/github`,
					)
				}

				// For fresh installs and other callbacks, state is required
				if (!encodedState) {
					return yield* Effect.fail(
						new InvalidOAuthStateError({ message: "Missing OAuth state" }),
					)
				}

				// Parse and validate state
				const parsedState = yield* Effect.try({
					try: () =>
						Schema.decodeUnknownSync(OAuthState)(JSON.parse(decodeURIComponent(encodedState))),
					catch: () => new InvalidOAuthStateError({ message: "Invalid OAuth state" }),
				})

				// Check if we need to redirect to local environment
				// This happens when production receives a callback for a local dev flow
				const nodeEnv = yield* Config.string("NODE_ENV").pipe(
					Config.withDefault("production"),
					Effect.orDie,
				)
				const isProduction = nodeEnv !== "development"

				if (isProduction && parsedState.environment === "local") {
					// Redirect to localhost with all params preserved
					const localUrl = new URL(`http://localhost:3003/integrations/${provider}/callback`)
					if (installation_id) localUrl.searchParams.set("installation_id", installation_id)
					if (code) localUrl.searchParams.set("code", code)
					localUrl.searchParams.set("state", encodedState)

					return HttpServerResponse.empty({
						status: 302,
						headers: { Location: localUrl.toString() },
					})
				}

				// Get the OAuth provider from registry
				const registry = yield* OAuthProviderRegistry
				const oauthProvider = yield* registry.getProvider(provider).pipe(
					Effect.mapError(
						(error) =>
							new InvalidOAuthStateError({
								message: `Provider not available: ${error._tag}`,
							}),
					),
				)

				const connectionRepo = yield* IntegrationConnectionRepo
				const tokenService = yield* IntegrationTokenService

				// Determine if this is a GitHub App installation callback
				// GitHub App callbacks have `installation_id` instead of `code`
				const isGitHubAppCallback = provider === "github" && installation_id

				// Use installation_id as "code" for GitHub App (the provider handles this)
				const authCode = isGitHubAppCallback ? installation_id : code

				if (!authCode) {
					return yield* Effect.fail(
						new InvalidOAuthStateError({
							message: "Missing authorization code or installation ID",
						}),
					)
				}

				// Exchange code for tokens using the provider
				// For GitHub App, this generates an installation token using JWT
				const tokens = yield* oauthProvider.exchangeCodeForTokens(authCode).pipe(
					Effect.mapError(
						(error) =>
							new InvalidOAuthStateError({
								message: error.message,
							}),
					),
				)

				// Get account info from provider
				const accountInfo = yield* oauthProvider.getAccountInfo(tokens.accessToken).pipe(
					Effect.mapError(
						(error) =>
							new InvalidOAuthStateError({
								message: error.message,
							}),
					),
				)

				// Prepare connection settings
				// For GitHub App, store the installation ID for token regeneration
				const settings = isGitHubAppCallback ? { installationId: installation_id } : null

				// Create or update connection
				const connection = yield* connectionRepo
					.upsertByOrgAndProvider({
						provider,
						organizationId: parsedState.organizationId as OrganizationId,
						userId: null, // org-level connection
						level: "organization",
						status: "active",
						externalAccountId: accountInfo.externalAccountId,
						externalAccountName: accountInfo.externalAccountName,
						connectedBy: parsedState.userId as UserId,
						settings,
						errorMessage: null,
						lastUsedAt: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				// Store encrypted tokens
				yield* tokenService.storeTokens(connection.id, {
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					expiresAt: tokens.expiresAt,
					scope: tokens.scope,
				})

				// Redirect back to the settings page
				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: parsedState.returnTo,
					},
				})
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error during OAuth callback",
								detail: String(error),
							}),
						),
					ParseError: (error) =>
						Effect.fail(
							new InvalidOAuthStateError({
								message: `Failed to parse response: ${String(error)}`,
							}),
						),
					IntegrationEncryptionError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Failed to encrypt tokens",
								detail: String(error),
							}),
						),
				}),
			),
		)

		/**
		 * Get connection status for a provider.
		 */
		.handle("getConnectionStatus", ({ path }) =>
			Effect.gen(function* () {
				const { orgId, provider } = path
				const connectionRepo = yield* IntegrationConnectionRepo

				const connectionOption = yield* connectionRepo
					.findByOrgAndProvider(orgId, provider)
					.pipe(withSystemActor)

				if (Option.isNone(connectionOption)) {
					return new ConnectionStatusResponse({
						connected: false,
						provider,
						externalAccountName: null,
						status: null,
						connectedAt: null,
						lastUsedAt: null,
					})
				}

				const connection = connectionOption.value
				return new ConnectionStatusResponse({
					connected: connection.status === "active",
					provider,
					externalAccountName: connection.externalAccountName,
					status: connection.status,
					connectedAt: connection.createdAt ?? null,
					lastUsedAt: connection.lastUsedAt ?? null,
				})
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Failed to get connection status",
							detail: String(error),
						}),
					),
				),
			),
		)

		/**
		 * Disconnect an integration and revoke tokens.
		 */
		.handle("disconnect", ({ path }) =>
			Effect.gen(function* () {
				const { orgId, provider } = path
				const connectionRepo = yield* IntegrationConnectionRepo
				const tokenService = yield* IntegrationTokenService

				const connectionOption = yield* connectionRepo
					.findByOrgAndProvider(orgId, provider)
					.pipe(withSystemActor)

				if (Option.isNone(connectionOption)) {
					return yield* Effect.fail(new IntegrationNotConnectedError({ provider }))
				}

				const connection = connectionOption.value

				// Delete tokens first
				yield* tokenService.deleteTokens(connection.id)

				// Soft delete the connection
				yield* connectionRepo.softDelete(connection.id).pipe(withSystemActor)
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Failed to disconnect integration",
							detail: String(error),
						}),
					),
				),
			),
		),
)
