import { UserError } from "rivetkit"
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose"
import type { AuthenticatedClient, BotClient, BotTokenValidationResponse, UserClient } from "./types"
import type { BotId, OrganizationId, UserId } from "@hazel/schema"

// Cache JWKS for WorkOS
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null

function getJwks(clientId: string) {
	if (!jwksCache) {
		jwksCache = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))
	}
	return jwksCache
}

/**
 * Check if a token looks like a JWT (three base64url-encoded segments)
 */
function isJwtToken(token: string): boolean {
	const parts = token.split(".")
	return parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
}

/**
 * Check if a token is a bot token (hzl_bot_xxxxx format)
 */
function isBotToken(token: string): boolean {
	return token.startsWith("hzl_bot_")
}

interface JWTPayloadWithClaims extends JWTPayload {
	org_id?: string
	role?: string
}

/**
 * Validate a WorkOS JWT token.
 * Verifies the signature against WorkOS JWKS and extracts user identity.
 */
async function validateJwt(token: string, config: TokenValidationConfig): Promise<UserClient> {
	const jwks = getJwks(config.workosClientId)

	// WorkOS can issue tokens with either issuer format
	const issuers = [
		"https://api.workos.com",
		`https://api.workos.com/user_management/${config.workosClientId}`,
	]

	let payload: JWTPayloadWithClaims | null = null

	for (const issuer of issuers) {
		try {
			const result = await jwtVerify(token, jwks, { issuer })
			payload = result.payload as JWTPayloadWithClaims
			break
		} catch {
			// Try next issuer
		}
	}

	if (!payload) {
		throw new UserError("Invalid or expired token", { code: "invalid_token" })
	}

	const userId = payload.sub
	if (!userId) {
		throw new UserError("Token missing user ID", { code: "invalid_token" })
	}

	// Extract org_id if present (WorkOS org ID, not internal UUID)
	// Note: For now we store WorkOS org ID; can be resolved to internal ID if needed
	const organizationId = payload.org_id as OrganizationId | undefined
	const role = (payload.role as "admin" | "member" | "owner") || "member"

	return {
		type: "user",
		userId: userId as UserId,
		organizationId: organizationId ?? null,
		role,
	}
}

/**
 * Validate a bot token by calling the backend validation endpoint.
 * Bot tokens are hashed and looked up in the database.
 */
async function validateBotToken(token: string, config: TokenValidationConfig): Promise<BotClient> {
	const response = await fetch(`${config.backendUrl}/internal/actors/validate-bot-token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			// Use internal secret for server-to-server auth
			...(config.internalSecret && { "X-Internal-Secret": config.internalSecret }),
		},
		body: JSON.stringify({ token }),
	})

	if (!response.ok) {
		const errorText = await response.text().catch(() => "Unknown error")
		throw new UserError("Invalid bot token", {
			code: "invalid_token",
			metadata: { detail: errorText },
		})
	}

	const data = (await response.json()) as BotTokenValidationResponse

	return {
		type: "bot",
		userId: data.userId as UserId,
		botId: data.botId as BotId,
		organizationId: (data.organizationId as OrganizationId) ?? null,
		scopes: data.scopes,
	}
}

/**
 * Configuration required for token validation
 */
export interface TokenValidationConfig {
	/** WorkOS client ID for JWT validation */
	readonly workosClientId: string
	/** Backend URL for bot token validation */
	readonly backendUrl: string
	/** Internal secret for server-to-server auth (optional) */
	readonly internalSecret?: string
}

/**
 * Load token validation config from environment variables.
 * Throws if required variables are missing.
 */
export function loadConfigFromEnv(): TokenValidationConfig {
	const workosClientId = process.env.WORKOS_CLIENT_ID
	// Check multiple env var names for backend URL
	const backendUrl =
		process.env.BACKEND_URL ||
		process.env.API_BASE_URL ||
		process.env.VITE_BACKEND_URL ||
		process.env.VITE_API_BASE_URL

	if (!workosClientId) {
		throw new Error("WORKOS_CLIENT_ID environment variable is required for actor authentication")
	}
	if (!backendUrl) {
		throw new Error(
			"BACKEND_URL or API_BASE_URL environment variable is required for actor authentication",
		)
	}

	return {
		workosClientId,
		backendUrl,
		internalSecret: process.env.INTERNAL_SECRET,
	}
}

// Cached config loaded from environment
let cachedConfig: TokenValidationConfig | null = null

/**
 * Get or load the token validation config from environment.
 */
export function getConfig(): TokenValidationConfig {
	if (!cachedConfig) {
		cachedConfig = loadConfigFromEnv()
	}
	return cachedConfig
}

/**
 * Validate a token (JWT or bot token) and return the authenticated client identity.
 *
 * @param token - The token to validate (JWT or hzl_bot_xxxxx)
 * @param config - Optional config override; uses environment variables if not provided
 * @returns AuthenticatedClient with user/bot identity
 * @throws UserError if token is invalid or missing
 */
export async function validateToken(
	token: string,
	config?: TokenValidationConfig,
): Promise<AuthenticatedClient> {
	const resolvedConfig = config ?? getConfig()

	if (isBotToken(token)) {
		return validateBotToken(token, resolvedConfig)
	}

	if (isJwtToken(token)) {
		return validateJwt(token, resolvedConfig)
	}

	throw new UserError("Invalid token format", { code: "invalid_token" })
}
