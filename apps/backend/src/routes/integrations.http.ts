import { HttpApiBuilder, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { IntegrationConnectionRepo, OrganizationRepo } from "@hazel/backend-core"
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
 * OAuth session cookie name prefix - combined with provider for uniqueness
 */
const OAUTH_SESSION_COOKIE_PREFIX = "oauth_session_"

/**
 * OAuth session cookie max age in seconds (15 minutes)
 */
const OAUTH_SESSION_COOKIE_MAX_AGE = 15 * 60

/**
 * Initiate OAuth flow for a provider.
 * Sets a session cookie with context and redirects to the provider's OAuth consent page.
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
	const cookieDomain = yield* Config.string("WORKOS_COOKIE_DOMAIN").pipe(Effect.orDie)

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

	// Build state object for OAuth flow
	const stateData = {
		organizationId: orgId,
		userId: currentUser.id,
		returnTo: `${frontendUrl}/${org.slug}/settings/integrations/${provider}`,
		environment,
	}

	// Encode state with return URL, context, and environment
	const state = encodeURIComponent(JSON.stringify(stateData))

	// Build authorization URL using the provider
	const authorizationUrl = yield* oauthProvider.buildAuthorizationUrl(state)

	yield* Effect.logInfo("OAuth flow initiated", {
		event: "oauth_flow_initiated",
		provider,
		organizationId: orgId,
		userId: currentUser.id,
	})

	// Build session cookie with OAuth context
	// This cookie is used as a fallback when GitHub drops the state parameter
	// (e.g., when setup_action=update for already-installed apps)
	const sessionCookieValue = encodeURIComponent(
		JSON.stringify({
			...stateData,
			createdAt: Date.now(),
		}),
	)
	const sessionCookieName = `${OAUTH_SESSION_COOKIE_PREFIX}${provider}`

	// Build Set-Cookie header value for session cookie
	// This cookie is used for state recovery during callback
	const cookieHeader = `${sessionCookieName}=${sessionCookieValue}; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=${OAUTH_SESSION_COOKIE_MAX_AGE}`

	// Return JSON response with authorization URL and session cookie
	return yield* HttpServerResponse.json(
		{ authorizationUrl: authorizationUrl.toString() },
		{
			headers: {
				"Set-Cookie": cookieHeader,
			},
		},
	).pipe(
		Effect.catchTag("HttpBodyError", (e) =>
			Effect.fail(
				new InternalServerError({ message: "Failed to serialize response", detail: String(e) }),
			),
		),
	)
})

/**
 * OAuth session state schema - stored in session cookie
 * Includes createdAt for expiration checking
 */
const OAuthSessionState = Schema.Struct({
	organizationId: Schema.String,
	userId: Schema.String,
	returnTo: Schema.String,
	environment: Schema.optional(Schema.Literal("local", "production")),
	createdAt: Schema.Number,
})

/**
 * Handle OAuth callback from provider.
 * Exchanges authorization code for tokens and stores the connection.
 *
 * For GitHub App: Receives `installation_id` instead of `code`.
 * For standard OAuth: Receives `code` authorization code.
 *
 * State recovery priority:
 * 1. URL state parameter (standard OAuth flow)
 * 2. Session cookie (fallback for GitHub App updates when state is dropped)
 * 3. Installation ID lookup (GitHub-initiated callbacks, not user-initiated)
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

	// Get request to read cookies
	const request = yield* HttpServerRequest.HttpServerRequest
	const sessionCookieName = `${OAUTH_SESSION_COOKIE_PREFIX}${provider}`
	const sessionCookie = request.cookies[sessionCookieName]
	const cookieDomain = yield* Config.string("WORKOS_COOKIE_DOMAIN").pipe(Effect.orDie)

	yield* Effect.logInfo("OAuth callback received", {
		event: "integration_callback_start",
		provider,
		hasState: !!encodedState,
		hasSessionCookie: !!sessionCookie,
		hasInstallationId: !!installation_id,
		hasCode: !!code,
		setupAction: setup_action,
	})

	// Helper to build redirect with cookie clearing
	const buildRedirectWithCookieClear = (url: string) =>
		HttpServerResponse.empty({
			status: 302,
			headers: {
				Location: url,
				// Clear the session cookie after processing
				"Set-Cookie": `${sessionCookieName}=; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
			},
		})

	// Try to get state from URL parameter first
	let parsedState: typeof OAuthState.Type | null = null
	let stateSource: "url" | "cookie" | "installation_lookup" = "url"

	if (encodedState) {
		// Priority 1: State from URL parameter
		const stateResult = yield* Effect.try({
			try: () => Schema.decodeUnknownSync(OAuthState)(JSON.parse(decodeURIComponent(encodedState))),
			catch: (e) => new InvalidOAuthStateError({ message: `Invalid state: ${e}` }),
		}).pipe(Effect.option)

		if (Option.isSome(stateResult)) {
			parsedState = stateResult.value
			stateSource = "url"
		}
	}

	// Priority 2: Try session cookie if state is missing or invalid
	if (!parsedState && sessionCookie) {
		yield* Effect.logDebug("Attempting to recover state from session cookie", {
			event: "integration_callback_cookie_fallback",
			provider,
		})

		const sessionResult = yield* Effect.try({
			try: () =>
				Schema.decodeUnknownSync(OAuthSessionState)(JSON.parse(decodeURIComponent(sessionCookie))),
			catch: (e) => new InvalidOAuthStateError({ message: `Invalid session cookie: ${e}` }),
		}).pipe(Effect.option)

		if (Option.isSome(sessionResult)) {
			const session = sessionResult.value
			// Check if cookie has expired (15 minutes)
			const cookieAge = Date.now() - session.createdAt
			const maxAge = OAUTH_SESSION_COOKIE_MAX_AGE * 1000 // Convert to milliseconds

			if (cookieAge <= maxAge) {
				parsedState = {
					organizationId: session.organizationId,
					userId: session.userId,
					returnTo: session.returnTo,
					environment: session.environment,
				}
				stateSource = "cookie"

				yield* Effect.logInfo("OAuth state recovered from session cookie", {
					event: "integration_callback_cookie_recovery",
					provider,
					organizationId: session.organizationId,
					cookieAgeSeconds: Math.round(cookieAge / 1000),
				})
			} else {
				yield* Effect.logWarning("OAuth session cookie expired", {
					event: "integration_callback_cookie_expired",
					provider,
					cookieAgeSeconds: Math.round(cookieAge / 1000),
				})
			}
		}
	}

	// Priority 3: For GitHub update callbacks without state or cookie,
	// fall back to installation ID lookup (GitHub-initiated, not user-initiated)
	if (!parsedState && installation_id && setup_action === "update") {
		const connectionRepo = yield* IntegrationConnectionRepo
		const orgRepo = yield* OrganizationRepo
		const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

		yield* Effect.logInfo("GitHub update callback - looking up by installation ID", {
			event: "integration_callback_installation_lookup",
			installationId: installation_id,
		})

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
			return buildRedirectWithCookieClear(frontendUrl)
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
			return buildRedirectWithCookieClear(frontendUrl)
		}

		const org = orgOption.value

		yield* Effect.logInfo("GitHub update callback processed (installation lookup)", {
			event: "integration_callback_update_success",
			installationId: installation_id,
			organizationId: connection.organizationId,
		})

		// Redirect to the organization's GitHub integration settings with success status
		return buildRedirectWithCookieClear(
			buildRedirectUrl(`${frontendUrl}/${org.slug}/settings/integrations/github`, provider, "success"),
		)
	}

	// If we still don't have state, fail
	if (!parsedState) {
		yield* Effect.logError("OAuth callback missing state and no valid session cookie", {
			event: "integration_callback_missing_state",
			provider,
			hasSessionCookie: !!sessionCookie,
		})
		return yield* Effect.fail(new InvalidOAuthStateError({ message: "Missing OAuth state" }))
	}

	yield* Effect.logDebug("OAuth callback state resolved", {
		event: "integration_callback_state_resolved",
		provider,
		stateSource,
		organizationId: parsedState.organizationId,
	})

	yield* Effect.logDebug("OAuth callback state parsed", {
		event: "integration_callback_state_parsed",
		provider,
		organizationId: parsedState.organizationId,
		environment: parsedState.environment,
	})

	// Helper to redirect with error (clears session cookie)
	const redirectWithError = (errorCode: OAuthErrorCode) =>
		buildRedirectWithCookieClear(buildRedirectUrl(parsedState.returnTo, provider, "error", errorCode))

	// Check if we need to redirect to local environment
	// This happens when production receives a callback for a local dev flow
	const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("production"), Effect.orDie)
	const isProduction = nodeEnv !== "development"

	if (isProduction && parsedState.environment === "local") {
		yield* Effect.logDebug("OAuth callback redirecting to local environment", {
			event: "integration_callback_local_redirect",
			provider,
			stateSource,
		})
		// Redirect to localhost with all params preserved
		const localUrl = new URL(`http://localhost:3003/integrations/${provider}/callback`)
		if (installation_id) localUrl.searchParams.set("installation_id", installation_id)
		if (code) localUrl.searchParams.set("code", code)

		// If we recovered state from cookie, encode it and pass as state parameter
		// This ensures the local callback has the state even if GitHub dropped it
		const stateToPass =
			stateSource === "cookie"
				? encodeURIComponent(
						JSON.stringify({
							organizationId: parsedState.organizationId,
							userId: parsedState.userId,
							returnTo: parsedState.returnTo,
							environment: parsedState.environment,
						}),
					)
				: encodedState
		if (stateToPass) {
			localUrl.searchParams.set("state", stateToPass)
		}

		// Clear the cookie since we're forwarding to local
		return buildRedirectWithCookieClear(localUrl.toString())
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
	yield* Effect.logDebug("OAuth token exchange starting", {
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
	yield* Effect.logDebug("OAuth account info fetch starting", {
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
	yield* Effect.logDebug("OAuth account info fetch succeeded", {
		event: "integration_account_info_success",
		provider,
		externalAccountId: accountInfo.externalAccountId,
		externalAccountName: accountInfo.externalAccountName,
	})

	// Prepare connection metadata
	// For GitHub App, store the installation ID for token regeneration
	const metadata = isGitHubAppCallback ? { installationId: installation_id } : null

	// Create or update connection
	yield* Effect.logDebug("OAuth database upsert starting", {
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
	yield* Effect.logDebug("OAuth database upsert succeeded", {
		event: "integration_db_upsert_success",
		provider,
		connectionId: connection.id,
	})

	// Store encrypted tokens
	yield* Effect.logDebug("OAuth token storage starting", {
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

	yield* Effect.logDebug("OAuth token storage succeeded", {
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
		// Note: catchAll is intentional here - this is a best-effort operation
		// after OAuth success. We catch all errors to prevent disrupting the flow.
		Effect.catchAll((error) =>
			Effect.logWarning("Failed to add integration bot to org (non-critical)", {
				event: "integration_bot_add_failed",
				provider,
				organizationId: parsedState.organizationId,
				error: String(error),
			}),
		),
	)

	// Redirect back to the settings page with success status (clears session cookie)
	const successUrl = buildRedirectUrl(parsedState.returnTo, provider, "success")
	yield* Effect.logDebug("OAuth callback redirecting with success", {
		event: "integration_callback_redirect",
		provider,
		status: "success",
		stateSource,
		redirectUrl: successUrl,
	})

	return buildRedirectWithCookieClear(successUrl)
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
