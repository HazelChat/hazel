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
import type { IntegrationConnection } from "@hazel/domain/models"
import { Config, Effect, Option, Schedule, Schema } from "effect"
import { HazelApi } from "../api"
import { IntegrationConnectionRepo } from "../repositories/integration-connection-repo"
import { OrganizationRepo } from "../repositories/organization-repo"
import { IntegrationTokenService } from "../services/integration-token-service"
import { IntegrationBotService } from "../services/integrations/integration-bot-service"
import { OAuthProviderRegistry } from "../services/oauth"

/**
 * OAuth state schema - encoded in the state parameter during OAuth flow.
 * Contains context needed to complete the flow after callback.
 */
const OAuthState = Schema.Struct({
	organizationId: Schema.String,
	userId: Schema.String,
	/** Full URL to redirect after OAuth completes (e.g., http://localhost:3000/org/settings/integrations/github) */
	returnTo: Schema.String,
	/** Environment that initiated the OAuth flow. Used to redirect back to localhost for local dev. */
	environment: Schema.optional(Schema.Literal("local", "production")),
})

/**
 * Retry schedule for OAuth operations.
 * Retries up to 3 times with exponential backoff (100ms, 200ms, 400ms)
 */
const oauthRetrySchedule = Schedule.exponential("100 millis").pipe(Schedule.intersect(Schedule.recurs(3)))

/**
 * Error codes for OAuth callback failures (used in redirect URL params)
 */
type OAuthErrorCode =
	| "token_exchange_failed"
	| "account_info_failed"
	| "db_error"
	| "encryption_error"
	| "invalid_state"

/**
 * Check if an error is retryable (network error, rate limit, or server error)
 */
const isRetryableError = (error: { message: string; cause?: unknown }): boolean => {
	const message = error.message.toLowerCase()
	if (message.includes("network error") || message.includes("timeout")) {
		return true
	}
	// Check for status code in cause
	const cause = error.cause as { status?: number } | undefined
	if (cause?.status) {
		return cause.status === 429 || cause.status >= 500
	}
	return false
}

/**
 * Build redirect URL with connection status query params
 */
const buildRedirectUrl = (
	returnTo: string,
	provider: string,
	status: "success" | "error",
	errorCode?: OAuthErrorCode,
): string => {
	const url = new URL(returnTo)
	url.searchParams.set("connection_status", status)
	url.searchParams.set("provider", provider)
	if (errorCode) {
		url.searchParams.set("error_code", errorCode)
	}
	return url.toString()
}

/**
 * Get OAuth authorization URL for a provider.
 * Redirects the user to the provider's OAuth consent page.
 */
const handleGetOAuthUrl = Effect.fn("integrations.getOAuthUrl")(function* (path: {
	orgId: OrganizationId
	provider: IntegrationConnection.IntegrationProvider
}) {
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
	const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("production"), Effect.orDie)
	const environment = nodeEnv === "development" ? "local" : "production"

	// Encode state with return URL, context, and environment
	const state = encodeURIComponent(
		JSON.stringify({
			organizationId: orgId,
			userId: currentUser.id,
			returnTo: `${frontendUrl}/${org.slug}/settings/integrations/${provider}`,
			environment,
		}),
	)

	// Build authorization URL using the provider
	const authorizationUrl = yield* oauthProvider.buildAuthorizationUrl(state)

	return { authorizationUrl: authorizationUrl.toString() }
})

/**
 * Handle OAuth callback from provider.
 * Exchanges authorization code for tokens and stores the connection.
 *
 * For GitHub App: Receives `installation_id` instead of `code`.
 * For standard OAuth: Receives `code` authorization code.
 */
const handleOAuthCallback = Effect.fn("integrations.oauthCallback")(function* (
	path: { provider: IntegrationConnection.IntegrationProvider },
	urlParams: {
		code?: string
		state?: string
		installation_id?: string
		setup_action?: string
	},
) {
	const { provider } = path
	const { code, state: encodedState, installation_id, setup_action } = urlParams

	yield* Effect.logInfo("OAuth callback received", {
		event: "integration_callback_start",
		provider,
		hasState: !!encodedState,
		hasInstallationId: !!installation_id,
		hasCode: !!code,
		setupAction: setup_action,
	})

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
				event: "integration_callback_update_unknown",
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
				event: "integration_callback_update_org_not_found",
				organizationId: connection.organizationId,
			})
			return HttpServerResponse.redirect(frontendUrl)
		}

		const org = orgOption.value

		yield* Effect.logInfo("GitHub update callback processed", {
			event: "integration_callback_update_success",
			installationId: installation_id,
			organizationId: connection.organizationId,
		})

		// Redirect to the organization's GitHub integration settings with success status
		return HttpServerResponse.redirect(
			buildRedirectUrl(`${frontendUrl}/${org.slug}/settings/integrations/github`, provider, "success"),
		)
	}

	// For fresh installs and other callbacks, state is required
	if (!encodedState) {
		yield* Effect.logError("OAuth callback missing state", {
			event: "integration_callback_missing_state",
			provider,
		})
		return yield* Effect.fail(new InvalidOAuthStateError({ message: "Missing OAuth state" }))
	}

	// Parse and validate state
	const parsedState = yield* Effect.try({
		try: () => Schema.decodeUnknownSync(OAuthState)(JSON.parse(decodeURIComponent(encodedState))),
		catch: () => new InvalidOAuthStateError({ message: "Invalid OAuth state" }),
	}).pipe(
		Effect.tapError(() =>
			Effect.logError("OAuth callback invalid state", {
				event: "integration_callback_invalid_state",
				provider,
			}),
		),
	)

	yield* Effect.logInfo("OAuth callback state parsed", {
		event: "integration_callback_state_parsed",
		provider,
		organizationId: parsedState.organizationId,
		environment: parsedState.environment,
	})

	// Helper to redirect with error
	const redirectWithError = (errorCode: OAuthErrorCode) =>
		HttpServerResponse.redirect(buildRedirectUrl(parsedState.returnTo, provider, "error", errorCode))

	// Check if we need to redirect to local environment
	// This happens when production receives a callback for a local dev flow
	const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("production"), Effect.orDie)
	const isProduction = nodeEnv !== "development"

	if (isProduction && parsedState.environment === "local") {
		yield* Effect.logInfo("OAuth callback redirecting to local environment", {
			event: "integration_callback_local_redirect",
			provider,
		})
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
		Effect.tapError((error) =>
			Effect.logError("OAuth provider not available", {
				event: "integration_callback_provider_unavailable",
				provider,
				error: error._tag,
			}),
		),
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
		yield* Effect.logError("OAuth callback missing auth code", {
			event: "integration_callback_missing_code",
			provider,
			isGitHubApp: isGitHubAppCallback,
		})
		return redirectWithError("invalid_state")
	}

	// Exchange code for tokens using the provider (with retry for transient failures)
	yield* Effect.logInfo("OAuth token exchange starting", {
		event: "integration_token_exchange_attempt",
		provider,
		isGitHubApp: isGitHubAppCallback,
	})

	const tokensResult = yield* oauthProvider.exchangeCodeForTokens(authCode).pipe(
		Effect.retry({
			schedule: oauthRetrySchedule,
			while: isRetryableError,
		}),
		Effect.either,
	)

	if (tokensResult._tag === "Left") {
		const error = tokensResult.left
		yield* Effect.logError("OAuth token exchange failed", {
			event: "integration_token_exchange_failed",
			provider,
			error: error.message,
			isGitHubApp: isGitHubAppCallback,
		})
		return redirectWithError("token_exchange_failed")
	}

	const tokens = tokensResult.right
	yield* Effect.logInfo("OAuth token exchange succeeded", {
		event: "integration_token_exchange_success",
		provider,
		hasRefreshToken: !!tokens.refreshToken,
		expiresAt: tokens.expiresAt?.toISOString(),
	})

	// Get account info from provider (with retry for transient failures)
	yield* Effect.logInfo("OAuth account info fetch starting", {
		event: "integration_account_info_attempt",
		provider,
	})

	const accountInfoResult = yield* oauthProvider.getAccountInfo(tokens.accessToken).pipe(
		Effect.retry({
			schedule: oauthRetrySchedule,
			while: isRetryableError,
		}),
		Effect.either,
	)

	if (accountInfoResult._tag === "Left") {
		const error = accountInfoResult.left
		yield* Effect.logError("OAuth account info fetch failed", {
			event: "integration_account_info_failed",
			provider,
			error: error.message,
		})
		return redirectWithError("account_info_failed")
	}

	const accountInfo = accountInfoResult.right
	yield* Effect.logInfo("OAuth account info fetch succeeded", {
		event: "integration_account_info_success",
		provider,
		externalAccountId: accountInfo.externalAccountId,
		externalAccountName: accountInfo.externalAccountName,
	})

	// Prepare connection metadata
	// For GitHub App, store the installation ID for token regeneration
	const metadata = isGitHubAppCallback ? { installationId: installation_id } : null

	// Create or update connection
	yield* Effect.logInfo("OAuth database upsert starting", {
		event: "integration_db_upsert_attempt",
		provider,
		organizationId: parsedState.organizationId,
	})

	const connectionResult = yield* connectionRepo
		.upsertByOrgAndProvider({
			provider,
			organizationId: parsedState.organizationId as OrganizationId,
			userId: null, // org-level connection
			level: "organization",
			status: "active",
			externalAccountId: accountInfo.externalAccountId,
			externalAccountName: accountInfo.externalAccountName,
			connectedBy: parsedState.userId as UserId,
			settings: null,
			metadata,
			errorMessage: null,
			lastUsedAt: null,
			deletedAt: null,
		})
		.pipe(withSystemActor, Effect.either)

	if (connectionResult._tag === "Left") {
		yield* Effect.logError("OAuth database upsert failed", {
			event: "integration_db_upsert_failed",
			provider,
			error: String(connectionResult.left),
		})
		return redirectWithError("db_error")
	}

	const connection = connectionResult.right
	yield* Effect.logInfo("OAuth database upsert succeeded", {
		event: "integration_db_upsert_success",
		provider,
		connectionId: connection.id,
	})

	// Store encrypted tokens
	yield* Effect.logInfo("OAuth token storage starting", {
		event: "integration_token_storage_attempt",
		provider,
		connectionId: connection.id,
	})

	const storeResult = yield* tokenService
		.storeTokens(connection.id, {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			expiresAt: tokens.expiresAt,
			scope: tokens.scope,
		})
		.pipe(Effect.either)

	if (storeResult._tag === "Left") {
		yield* Effect.logError("OAuth token storage failed", {
			event: "integration_token_storage_failed",
			provider,
			connectionId: connection.id,
			error: String(storeResult.left),
		})
		return redirectWithError("encryption_error")
	}

	yield* Effect.logInfo("OAuth token storage succeeded", {
		event: "integration_token_storage_success",
		provider,
		connectionId: connection.id,
	})

	yield* Effect.logInfo("AUDIT: Integration connected", {
		event: "integration_connected",
		provider,
		organizationId: parsedState.organizationId,
		userId: parsedState.userId,
		level: "organization",
		externalAccountId: accountInfo.externalAccountId,
		externalAccountName: accountInfo.externalAccountName,
		isGitHubApp: isGitHubAppCallback,
		connectionId: connection.id,
	})

	// Add seeded bot to org for all OAuth integration providers
	// Bot user should already exist from seed script - this just adds org membership
	// This is best-effort - OAuth has already succeeded, so we just log and continue on error
	yield* IntegrationBotService.addBotToOrg(provider, parsedState.organizationId as OrganizationId).pipe(
		Effect.provide(IntegrationBotService.Default),
		Effect.tap((result) =>
			Option.isSome(result)
				? Effect.logInfo("Integration bot added to organization", {
						event: "integration_bot_added_to_org",
						provider,
						organizationId: parsedState.organizationId,
					})
				: Effect.logWarning("Integration bot not found - run seed script", {
						event: "integration_bot_not_seeded",
						provider,
						organizationId: parsedState.organizationId,
					}),
		),
		Effect.catchAll((error) =>
			Effect.logWarning("Failed to add integration bot to org (non-critical)", {
				event: "integration_bot_add_failed",
				provider,
				organizationId: parsedState.organizationId,
				error: String(error),
			}),
		),
	)

	// Redirect back to the settings page with success status
	const successUrl = buildRedirectUrl(parsedState.returnTo, provider, "success")
	yield* Effect.logInfo("OAuth callback redirecting with success", {
		event: "integration_callback_redirect",
		provider,
		status: "success",
		redirectUrl: successUrl,
	})

	return HttpServerResponse.redirect(successUrl)
})

/**
 * Get connection status for a provider.
 */
const handleGetConnectionStatus = Effect.fn("integrations.getConnectionStatus")(function* (path: {
	orgId: OrganizationId
	provider: IntegrationConnection.IntegrationProvider
}) {
	const { orgId, provider } = path
	const connectionRepo = yield* IntegrationConnectionRepo

	const connectionOption = yield* connectionRepo.findByOrgAndProvider(orgId, provider).pipe(withSystemActor)

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
})

/**
 * Disconnect an integration and revoke tokens.
 */
const handleDisconnect = Effect.fn("integrations.disconnect")(function* (path: {
	orgId: OrganizationId
	provider: IntegrationConnection.IntegrationProvider
}) {
	const { orgId, provider } = path
	const connectionRepo = yield* IntegrationConnectionRepo
	const tokenService = yield* IntegrationTokenService

	const connectionOption = yield* connectionRepo.findByOrgAndProvider(orgId, provider).pipe(withSystemActor)

	if (Option.isNone(connectionOption)) {
		return yield* Effect.fail(new IntegrationNotConnectedError({ provider }))
	}

	const connection = connectionOption.value

	// Delete tokens first
	yield* tokenService.deleteTokens(connection.id)

	// Soft delete the connection
	yield* connectionRepo.softDelete(connection.id).pipe(withSystemActor)

	yield* Effect.logInfo("AUDIT: Integration disconnected", {
		event: "integration_disconnected",
		provider,
		organizationId: orgId,
		connectionId: connection.id,
		externalAccountId: connection.externalAccountId,
		externalAccountName: connection.externalAccountName,
	})
})

export const HttpIntegrationLive = HttpApiBuilder.group(HazelApi, "integrations", (handlers) =>
	handlers
		.handle("getOAuthUrl", ({ path }) => handleGetOAuthUrl(path))
		.handle("oauthCallback", ({ path, urlParams }) =>
			handleOAuthCallback(path, urlParams).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error during OAuth callback",
							detail: String(error),
						}),
					),
				),
			),
		)
		.handle("getConnectionStatus", ({ path }) =>
			handleGetConnectionStatus(path).pipe(
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
		.handle("disconnect", ({ path }) =>
			handleDisconnect(path).pipe(
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
