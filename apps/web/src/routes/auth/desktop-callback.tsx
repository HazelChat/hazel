/**
 * @module Desktop OAuth callback page
 * @platform web (opened in browser during desktop OAuth)
 * @description Receives OAuth callback from WorkOS and forwards to desktop app's local server
 */

import {
	DesktopConnectionError,
	Http,
	InvalidDesktopStateError,
	MissingAuthCodeError,
	OAuthCallbackError,
} from "@hazel/domain"
import { createFileRoute } from "@tanstack/react-router"
import { Cause, Effect, Exit, Option, Schedule, Schema } from "effect"
import { useEffect, useRef, useState } from "react"
import { Logo } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"

// Schema for search params - state is already parsed by TanStack Router's JSON handling
const RawSearchParams = Schema.Struct({
	code: Schema.optional(Schema.String),
	state: Schema.optional(Http.DesktopAuthState),
	error: Schema.optional(Schema.String),
	error_description: Schema.optional(Schema.String),
})

type CallbackStatus =
	| { type: "connecting" }
	| { type: "success" }
	| { type: "error"; message: string; isRetryable: boolean }

export const Route = createFileRoute("/auth/desktop-callback")({
	component: DesktopCallbackPage,
	validateSearch: (search: Record<string, unknown>) => Schema.decodeUnknownSync(RawSearchParams)(search),
})

/**
 * Connect to desktop app's local server
 */
const connectToDesktop = (
	port: number,
	code: string,
	state: typeof Http.DesktopAuthState.Type,
	nonce: string,
) =>
	Effect.tryPromise({
		try: async () => {
			const response = await fetch(`http://127.0.0.1:${port}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code,
					state: JSON.stringify(state),
					nonce,
				}),
			})

			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: "Unknown error" }))
				throw new Error(error.error || `HTTP ${response.status}`)
			}

			return response
		},
		catch: (e) => e,
	})

/**
 * Effect-based callback handler with full error typing
 */
const handleCallbackEffect = (search: typeof RawSearchParams.Type) =>
	Effect.gen(function* () {
		// Check for OAuth errors from WorkOS
		if (search.error) {
			return yield* new OAuthCallbackError({
				message: search.error_description || search.error,
				error: search.error,
				errorDescription: search.error_description,
			})
		}

		// Validate required code
		if (!search.code) {
			return yield* new MissingAuthCodeError({
				message: "Missing authorization code",
			})
		}
		const code = search.code

		// State is already parsed and validated by TanStack Router + Schema
		if (!search.state) {
			return yield* new InvalidDesktopStateError({
				message: "Missing state parameter",
			})
		}
		const state = search.state

		// Validate desktop connection params
		if (state.desktopPort === undefined) {
			return yield* new InvalidDesktopStateError({
				message: "Missing desktop port in state",
			})
		}
		const port = state.desktopPort

		if (!state.desktopNonce) {
			return yield* new InvalidDesktopStateError({
				message: "Missing desktop nonce in state",
			})
		}
		const nonce = state.desktopNonce

		// Connect to desktop with exponential backoff retry
		yield* connectToDesktop(port, code, state, nonce).pipe(
			Effect.retry({
				times: 3,
				schedule: Schedule.exponential("500 millis"),
			}),
			Effect.mapError(
				() =>
					new DesktopConnectionError({
						message: "Could not connect to Hazel",
						port,
						attempts: 3,
					}),
			),
		)
	})

/**
 * Error info type for UI display
 */
type ErrorInfo = { message: string; isRetryable: boolean }

/**
 * Desktop callback error types
 */
type CallbackError =
	| OAuthCallbackError
	| MissingAuthCodeError
	| InvalidDesktopStateError
	| DesktopConnectionError

/**
 * Get user-friendly error message from typed error using switch statement
 */
function getErrorMessage(error: CallbackError): ErrorInfo {
	switch (error._tag) {
		case "OAuthCallbackError":
			return {
				message: error.errorDescription || error.error,
				isRetryable: true,
			}
		case "MissingAuthCodeError":
			return {
				message: "No authorization code received. Please try again.",
				isRetryable: true,
			}
		case "InvalidDesktopStateError":
			return {
				message: "Invalid authentication state. Please try again.",
				isRetryable: true,
			}
		case "DesktopConnectionError":
			return {
				message: "Could not connect to Hazel desktop app. Make sure Hazel is running.",
				isRetryable: true,
			}
	}
}

/**
 * Extract error info from Effect Exit with typed error handling
 */
function extractErrorFromExit(exit: Exit.Exit<void, CallbackError>): ErrorInfo {
	if (Exit.isSuccess(exit)) {
		return { message: "Success", isRetryable: false }
	}

	// Try to get the failure error
	const failureOpt = Cause.failureOption(exit.cause)
	if (Option.isSome(failureOpt)) {
		return getErrorMessage(failureOpt.value)
	}

	// Try to get defect (die)
	const dieOpt = Cause.dieOption(exit.cause)
	if (Option.isSome(dieOpt)) {
		const defect = dieOpt.value
		return {
			message: defect instanceof Error ? defect.message : String(defect),
			isRetryable: false,
		}
	}

	// Check if interrupted
	if (Cause.isInterrupted(exit.cause)) {
		return { message: "Operation was cancelled", isRetryable: true }
	}

	// Default fallback
	return { message: "An unknown error occurred", isRetryable: false }
}

function DesktopCallbackPage() {
	const search = Route.useSearch()
	const [status, setStatus] = useState<CallbackStatus>({ type: "connecting" })
	const hasStarted = useRef(false)

	useEffect(() => {
		if (hasStarted.current) return
		hasStarted.current = true
		handleCallback()
	}, [])

	async function handleCallback() {
		const exit = await Effect.runPromiseExit(handleCallbackEffect(search))

		if (Exit.isSuccess(exit)) {
			setStatus({ type: "success" })
		} else {
			// Extract error info using typed error handling
			const errorInfo = extractErrorFromExit(exit)
			console.error("[desktop-callback] Failed to contact desktop app:", exit.cause)
			setStatus({ type: "error", ...errorInfo })
		}
	}

	function handleRetry() {
		hasStarted.current = false
		setStatus({ type: "connecting" })
		handleCallback()
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg">
			<div className="flex max-w-md flex-col items-center gap-6 px-4 text-center">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<Logo className="size-12" />
					<span className="font-semibold text-3xl">Hazel</span>
				</div>

				{status.type === "connecting" && (
					<>
						<Loader className="size-8" />
						<div className="space-y-2">
							<h1 className="font-semibold text-xl">Connecting to Hazel...</h1>
							<p className="text-muted-fg text-sm">
								Please wait while we complete your sign in
							</p>
						</div>
					</>
				)}

				{status.type === "success" && (
					<div className="space-y-4">
						<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
							<svg
								className="size-8 text-success"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div className="space-y-2">
							<h1 className="font-semibold text-xl">Authentication Successful</h1>
							<p className="text-muted-fg text-sm">
								You can close this tab and return to Hazel
							</p>
						</div>
					</div>
				)}

				{status.type === "error" && (
					<div className="space-y-4">
						<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger/10">
							<svg
								className="size-8 text-danger"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<div className="space-y-2">
							<h1 className="font-semibold text-xl">Connection Failed</h1>
							<p className="text-muted-fg text-sm">{status.message}</p>
						</div>
						{status.isRetryable && (
							<div className="space-y-2">
								<Button intent="primary" onPress={handleRetry}>
									Try Again
								</Button>
								<p className="text-muted-fg text-xs">
									Make sure Hazel is running on your computer
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
