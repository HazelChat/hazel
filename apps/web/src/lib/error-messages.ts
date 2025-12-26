import type { HttpClientError } from "@effect/platform/HttpClientError"
import { RpcClientError } from "@effect/rpc/RpcClientError"
import {
	DmChannelAlreadyExistsError,
	InternalServerError,
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
	UnauthorizedError,
	WorkOSUserFetchError,
} from "@hazel/domain"
import { Cause, Chunk, Match, Option, Schema } from "effect"
import type { ParseError } from "effect/ParseResult"
import { OptimisticActionError, SyncError } from "../../../../libs/effect-electric-db-collection/src"

/**
 * User-friendly error message configuration
 */
export interface UserErrorMessage {
	title: string
	description?: string
	isRetryable: boolean
}

/**
 * Schema union for Schema-based common errors.
 * Used for type-safe error matching and runtime validation.
 */
export const CommonAppErrorSchema = Schema.Union(
	// Auth errors (401)
	UnauthorizedError,
	SessionNotProvidedError,
	SessionAuthenticationError,
	InvalidJwtPayloadError,
	SessionExpiredError,
	InvalidBearerTokenError,
	// Service errors (503)
	SessionLoadError,
	SessionRefreshError,
	WorkOSUserFetchError,
	// Business logic errors
	DmChannelAlreadyExistsError,
	// Server errors (500)
	InternalServerError,
	// Infrastructure errors (appear in most RPC calls)
	OptimisticActionError,
	SyncError,
	RpcClientError,
)

/**
 * Union of common application errors that have user-friendly messages.
 * Entity-specific errors (e.g., ChannelNotFoundError) should be handled
 * at the call site where context is available.
 *
 * Note: ParseError and HttpClientError are not Schema-based, so they're
 * added to the type union separately.
 */
export type CommonAppError =
	| typeof CommonAppErrorSchema.Type
	// Non-Schema errors (still have _tag but not Schema.TaggedError)
	| ParseError
	| HttpClientError

/**
 * Type-safe matcher for common application errors.
 * Returns UserErrorMessage for known errors.
 */
export const getCommonErrorMessage = Match.type<CommonAppError>().pipe(
	// Auth errors (401) - User needs to re-authenticate
	Match.tag("UnauthorizedError", () => ({
		title: "You don't have permission to do this",
		description: "Contact your admin if you need access.",
		isRetryable: false,
	})),
	Match.tag("SessionExpiredError", () => ({
		title: "Your session has expired",
		description: "Please sign in again to continue.",
		isRetryable: false,
	})),
	Match.tag("SessionNotProvidedError", () => ({
		title: "Please sign in to continue",
		description: "You need to be signed in to perform this action.",
		isRetryable: false,
	})),
	Match.tag("SessionAuthenticationError", () => ({
		title: "Authentication failed",
		description: "Please sign in again.",
		isRetryable: false,
	})),
	Match.tag("InvalidJwtPayloadError", () => ({
		title: "Invalid session",
		description: "Please sign in again.",
		isRetryable: false,
	})),
	Match.tag("InvalidBearerTokenError", () => ({
		title: "Invalid authentication",
		description: "Please sign in again.",
		isRetryable: false,
	})),

	// Service errors (503) - User can retry
	Match.tag("SessionLoadError", () => ({
		title: "Service temporarily unavailable",
		description: "We're having trouble connecting. Please try again.",
		isRetryable: true,
	})),
	Match.tag("SessionRefreshError", () => ({
		title: "Session refresh failed",
		description: "Please sign in again.",
		isRetryable: false,
	})),
	Match.tag("WorkOSUserFetchError", () => ({
		title: "Unable to load your profile",
		description: "Please try refreshing the page.",
		isRetryable: true,
	})),

	// Business logic errors (409)
	Match.tag("DmChannelAlreadyExistsError", () => ({
		title: "This conversation already exists",
		description: "You already have a direct message with this person.",
		isRetryable: false,
	})),

	// Server errors (500)
	Match.tag("InternalServerError", () => ({
		title: "Something went wrong",
		description: "Please try again later.",
		isRetryable: true,
	})),

	// Infrastructure errors - generic handling
	Match.tag("OptimisticActionError", () => ({
		title: "Action failed",
		description: "Please try again.",
		isRetryable: true,
	})),
	Match.tag("SyncError", () => ({
		title: "Sync failed",
		description: "Please try again.",
		isRetryable: true,
	})),
	Match.tag("RpcClientError", () => ({
		title: "Request failed",
		description: "Please try again.",
		isRetryable: true,
	})),
	Match.tag("ParseError", () => ({
		title: "Invalid response",
		description: "Please try again.",
		isRetryable: true,
	})),
	Match.tag("RequestError", () => ({
		title: "Connection failed",
		description: "Please check your internet connection.",
		isRetryable: true,
	})),
	Match.tag("ResponseError", () => ({
		title: "Server error",
		description: "Please try again later.",
		isRetryable: true,
	})),

	Match.exhaustive,
)

/**
 * Network error message for connection issues
 */
const NETWORK_ERROR_MESSAGE: UserErrorMessage = {
	title: "Connection lost",
	description: "Check your internet connection and try again.",
	isRetryable: true,
}

/**
 * Timeout error message
 */
const TIMEOUT_ERROR_MESSAGE: UserErrorMessage = {
	title: "Request timed out",
	description: "The server is taking too long to respond. Please try again.",
	isRetryable: true,
}

/**
 * Default fallback error message
 */
export const DEFAULT_ERROR_MESSAGE: UserErrorMessage = {
	title: "An error occurred",
	description: undefined,
	isRetryable: false,
}

/**
 * Schema.is for Schema-based common errors (fast path)
 */
const isSchemaCommonError = Schema.is(CommonAppErrorSchema)

/**
 * Tags for non-Schema errors that are still common
 */
const NON_SCHEMA_COMMON_TAGS = new Set(["ParseError", "RequestError", "ResponseError"])

/**
 * Type guard for CommonAppError.
 * Uses Schema.is for Schema-based errors and tag check for others.
 */
export function isCommonAppError(error: unknown): error is CommonAppError {
	// Fast path for Schema-based errors
	if (isSchemaCommonError(error)) return true

	// Check non-Schema errors by _tag
	if (typeof error === "object" && error !== null && "_tag" in error) {
		const tag = (error as { _tag: string })._tag
		return NON_SCHEMA_COMMON_TAGS.has(tag)
	}
	return false
}

/**
 * Checks if an error is a network/transport error
 */
function isNetworkError(error: unknown): boolean {
	if (typeof error !== "object" || error === null) return false

	// Effect HttpClientError.RequestError with Transport reason
	if ("_tag" in error && error._tag === "RequestError" && "reason" in error) {
		return (error as { reason: string }).reason === "Transport"
	}

	// Standard fetch errors
	if (error instanceof TypeError && error.message.includes("fetch")) {
		return true
	}

	return false
}

/**
 * Checks if an error is a timeout error
 */
function isTimeoutError(error: unknown): boolean {
	if (typeof error !== "object" || error === null) return false
	if ("_tag" in error) {
		return (error as { _tag: string })._tag === "TimeoutException"
	}
	return false
}

/**
 * Extracts user-friendly error information from a Cause.
 * Uses type-safe Match for common errors, falls back to message extraction.
 */
export function getUserFriendlyError<E>(cause: Cause.Cause<E>): UserErrorMessage {
	const failures = Cause.failures(cause)
	const firstFailureOption = Chunk.head(failures)

	if (Option.isSome(firstFailureOption)) {
		const error = firstFailureOption.value

		// Check for network errors first
		if (isNetworkError(error)) {
			return NETWORK_ERROR_MESSAGE
		}

		// Check for timeout errors
		if (isTimeoutError(error)) {
			return TIMEOUT_ERROR_MESSAGE
		}

		// Use type-safe matcher for common errors
		if (isCommonAppError(error)) {
			return getCommonErrorMessage(error)
		}

		// Fall back to extracting message property for unknown tagged errors
		if (typeof error === "object" && error !== null && "message" in error) {
			return {
				title: String((error as { message: unknown }).message),
				isRetryable: false,
			}
		}

		if (error instanceof Error) {
			return { title: error.message, isRetryable: false }
		}

		if (typeof error === "string") {
			return { title: error, isRetryable: false }
		}
	}

	// Check defects (unexpected errors)
	const defects = Cause.defects(cause)
	const firstDefectOption = Chunk.head(defects)

	if (Option.isSome(firstDefectOption)) {
		const defect = firstDefectOption.value
		if (defect instanceof Error) {
			return { title: defect.message, isRetryable: false }
		}
	}

	return DEFAULT_ERROR_MESSAGE
}

/**
 * Gets just the user-friendly message string from a Cause.
 * Convenience wrapper around getUserFriendlyError.
 */
export function getUserFriendlyMessage<E>(cause: Cause.Cause<E>): string {
	return getUserFriendlyError(cause).title
}

/**
 * Determines if an error is retryable based on its type.
 */
export function isRetryableError<E>(cause: Cause.Cause<E>): boolean {
	return getUserFriendlyError(cause).isRetryable
}
