/**
 * @module Web OAuth callback page
 * @platform web
 * @description Receives OAuth callback from WorkOS, exchanges code for JWT tokens, and stores them in localStorage
 */

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Schema } from "effect"
import { useEffect, useMemo } from "react"
import {
	createWebCallbackInitAtom,
	retryWebCallbackAtom,
	webCallbackStatusAtom,
} from "~/atoms/web-callback-atoms"
import { Logo } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"

// Schema for auth state - can be string (raw JSON) or already parsed object
const AuthStateSchema = Schema.Struct({
	returnTo: Schema.String,
})

// Schema for search params - state can be string or parsed object (TanStack Router auto-parses JSON)
const RawSearchParams = Schema.Struct({
	code: Schema.optional(Schema.String),
	state: Schema.optional(Schema.Union(Schema.String, AuthStateSchema)),
	error: Schema.optional(Schema.String),
	error_description: Schema.optional(Schema.String),
})

export const Route = createFileRoute("/auth/callback")({
	component: WebCallbackPage,
	validateSearch: (search: Record<string, unknown>) => Schema.decodeUnknownSync(RawSearchParams)(search),
})

function WebCallbackPage() {
	const search = Route.useSearch()
	const navigate = useNavigate()
	const status = useAtomValue(webCallbackStatusAtom)

	// Create and mount init atom - triggers callback automatically when mounted
	const initAtom = useMemo(() => createWebCallbackInitAtom(search), [search])
	useAtomValue(initAtom)

	// Get action atom setters
	const retryCallback = useAtomSet(retryWebCallbackAtom)

	// Redirect on success
	useEffect(() => {
		if (status._tag === "success") {
			// Small delay to show success state before redirect
			const timer = setTimeout(() => {
				navigate({ to: status.returnTo, replace: true })
			}, 500)
			return () => clearTimeout(timer)
		}
	}, [status, navigate])

	function handleRetry() {
		retryCallback(search)
	}

	function handleBackToLogin() {
		navigate({ to: "/auth/login", replace: true })
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg">
			<div className="flex max-w-md flex-col items-center gap-6 px-4 text-center">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<Logo className="size-12" />
					<span className="font-semibold text-3xl">Hazel</span>
				</div>

				{(status._tag === "idle" || status._tag === "exchanging") && (
					<>
						<Loader className="size-8" />
						<div className="space-y-2">
							<h1 className="font-semibold text-xl">Signing you in...</h1>
							<p className="text-muted-fg text-sm">
								Please wait while we complete authentication
							</p>
						</div>
					</>
				)}

				{status._tag === "success" && (
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
							<p className="text-muted-fg text-sm">Redirecting you to the app...</p>
						</div>
					</div>
				)}

				{status._tag === "error" && (
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
							<h1 className="font-semibold text-xl">Authentication Failed</h1>
							<p className="text-muted-fg text-sm">{status.message}</p>
						</div>
						<div className="space-y-3">
							<div className="flex flex-col gap-2">
								{status.isRetryable && (
									<Button intent="primary" onPress={handleRetry}>
										Try Again
									</Button>
								)}
								<Button intent="secondary" onPress={handleBackToLogin}>
									Back to Login
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
