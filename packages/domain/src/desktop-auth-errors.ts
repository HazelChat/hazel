/**
 * @module Desktop authentication error types
 * @description Typed errors for desktop OAuth flow with full Effect error safety
 */

import { Schema } from "effect"

// ============================================================================
// Tauri Environment Errors
// ============================================================================

/**
 * Tauri API not available in the current environment
 */
export class TauriNotAvailableError extends Schema.TaggedErrorClass<TauriNotAvailableError>()(
	"TauriNotAvailableError",
	{
		message: Schema.String,
		component: Schema.Literals(["opener", "core", "event", "store"]),
	},
) {}

/**
 * A Tauri command invocation failed
 */
export class TauriCommandError extends Schema.TaggedErrorClass<TauriCommandError>()("TauriCommandError", {
	message: Schema.String,
	command: Schema.String,
	detail: Schema.optional(Schema.String),
}) {}

// ============================================================================
// OAuth Flow Errors
// ============================================================================

/**
 * OAuth callback timed out waiting for user to complete authentication
 */
export class OAuthTimeoutError extends Schema.TaggedErrorClass<OAuthTimeoutError>()("OAuthTimeoutError", {
	message: Schema.String,
}) {}

/**
 * OAuth provider returned an error during authentication
 */
export class OAuthCallbackError extends Schema.TaggedErrorClass<OAuthCallbackError>()("OAuthCallbackError", {
	message: Schema.String,
	error: Schema.String,
	errorDescription: Schema.optional(Schema.String),
}) {}

/**
 * No authorization code was received from OAuth callback
 */
export class MissingAuthCodeError extends Schema.TaggedErrorClass<MissingAuthCodeError>()("MissingAuthCodeError", {
	message: Schema.String,
}) {}

// ============================================================================
// Token Storage Errors
// ============================================================================

/**
 * Failed to perform an operation on the token store
 */
export class TokenStoreError extends Schema.TaggedErrorClass<TokenStoreError>()("TokenStoreError", {
	message: Schema.String,
	operation: Schema.Literals(["load", "get", "set", "delete"]),
	detail: Schema.optional(Schema.String),
}) {}

/**
 * A required token was not found in the store
 */
export class TokenNotFoundError extends Schema.TaggedErrorClass<TokenNotFoundError>()("TokenNotFoundError", {
	message: Schema.String,
	tokenType: Schema.Literals(["access", "refresh", "expiresAt"]),
}) {}

// ============================================================================
// Token Exchange Errors
// ============================================================================

/**
 * Failed to exchange authorization code for tokens
 */
export class TokenExchangeError extends Schema.TaggedErrorClass<TokenExchangeError>()("TokenExchangeError", {
	message: Schema.String,
	detail: Schema.optional(Schema.String),
}) {}

/**
 * Failed to decode token response from server
 */
export class TokenDecodeError extends Schema.TaggedErrorClass<TokenDecodeError>()("TokenDecodeError", {
	message: Schema.String,
	detail: Schema.optional(Schema.String),
}) {}

// ============================================================================
// Desktop Callback Errors
// ============================================================================

/**
 * Failed to connect to the desktop app's local OAuth server
 */
export class DesktopConnectionError extends Schema.TaggedErrorClass<DesktopConnectionError>()(
	"DesktopConnectionError",
	{
		message: Schema.String,
		port: Schema.Number,
		attempts: Schema.Number,
	},
) {}

/**
 * Invalid OAuth state parameter received in callback
 */
export class InvalidDesktopStateError extends Schema.TaggedErrorClass<InvalidDesktopStateError>()(
	"InvalidDesktopStateError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}
