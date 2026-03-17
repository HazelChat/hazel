import {
	MissingAuthCodeError,
	OAuthCallbackError,
	OAuthCodeExpiredError,
	OAuthRedemptionPendingError,
	OAuthStateMismatchError,
	TokenDecodeError,
	TokenExchangeError,
} from "@hazel/domain/errors"

export type WebAuthError =
	| OAuthCallbackError
	| MissingAuthCodeError
	| OAuthCodeExpiredError
	| OAuthStateMismatchError
	| OAuthRedemptionPendingError
	| TokenExchangeError
	| TokenDecodeError

export type WebAuthErrorInfo = {
	message: string
	isRetryable: boolean
}

export const getWebAuthErrorInfo = (error: WebAuthError): WebAuthErrorInfo => {
	switch (error._tag) {
		case "OAuthCallbackError":
			return {
				message: error.errorDescription || error.error,
				isRetryable: true,
			}
		case "MissingAuthCodeError":
			return {
				message: "We did not receive a valid login callback. Please try again.",
				isRetryable: true,
			}
		case "OAuthCodeExpiredError":
			return {
				message: "This login code is no longer valid. Please start login again.",
				isRetryable: false,
			}
		case "OAuthStateMismatchError":
			return {
				message: "This login callback did not match the active session. Please start again.",
				isRetryable: false,
			}
		case "OAuthRedemptionPendingError":
			return {
				message: "Login is still finishing in another request. Please try again in a moment.",
				isRetryable: true,
			}
		case "TokenDecodeError":
			return {
				message: "The server returned an invalid auth response. Please try again.",
				isRetryable: true,
			}
		case "TokenExchangeError":
			return {
				message: error.message || "Failed to exchange authorization code.",
				isRetryable: true,
			}
	}
}
