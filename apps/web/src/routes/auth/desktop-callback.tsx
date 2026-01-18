/**
 * @module Desktop OAuth callback page
 * @platform web (opened in browser during desktop OAuth)
 * @description Receives OAuth callback from WorkOS and forwards to desktop app's local server
 */

import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { Logo } from "~/components/logo"
import { Loader } from "~/components/ui/loader"
import { Button } from "~/components/ui/button"

interface DesktopAuthState {
	returnTo: string
	desktopPort?: number
	desktopNonce?: string
}

type CallbackStatus = { type: "connecting" } | { type: "success" } | { type: "error"; message: string }

export const Route = createFileRoute("/auth/desktop-callback")({
	component: DesktopCallbackPage,
	validateSearch: (
		search: Record<string, unknown>,
	): {
		code?: string
		state?: DesktopAuthState
		error?: string
		error_description?: string
	} => ({
		code: search.code as string | undefined,
		state: search.state as DesktopAuthState | undefined,
		error: search.error as string | undefined,
		error_description: search.error_description as string | undefined,
	}),
})

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
		// Check for OAuth errors from WorkOS
		if (search.error) {
			setStatus({
				type: "error",
				message: search.error_description || search.error,
			})
			return
		}

		// Validate required params
		if (!search.code || !search.state) {
			setStatus({ type: "error", message: "Missing authorization code or state" })
			return
		}

		// State is already parsed by TanStack Router
		const state = search.state

		// Validate desktop connection params
		if (!state.desktopPort || !state.desktopNonce) {
			setStatus({ type: "error", message: "Missing desktop connection parameters" })
			return
		}

		// POST to desktop app's local server with retry logic
		try {
			const response = await connectWithRetry(state.desktopPort, {
				code: search.code,
				state: JSON.stringify(state),
				nonce: state.desktopNonce,
			})

			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: "Unknown error" }))
				throw new Error(error.error || `HTTP ${response.status}`)
			}

			setStatus({ type: "success" })
		} catch (error) {
			console.error("[desktop-callback] Failed to contact desktop app:", error)
			setStatus({
				type: "error",
				message:
					error instanceof Error
						? `Could not connect to Hazel: ${error.message}`
						: "Could not connect to Hazel desktop app",
			})
		}
	}

	async function connectWithRetry(port: number, body: object, maxRetries = 3): Promise<Response> {
		let lastError: Error | null = null

		for (let i = 0; i < maxRetries; i++) {
			try {
				const response = await fetch(`http://localhost:${port}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				})
				return response
			} catch (err) {
				lastError = err instanceof Error ? err : new Error(String(err))
				if (i < maxRetries - 1) {
					// Exponential backoff: 500ms, 1000ms, 2000ms
					await new Promise((r) => setTimeout(r, Math.pow(2, i) * 500))
				}
			}
		}

		throw lastError || new Error("Failed to connect after retries")
	}

	function handleRetry() {
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
						<div className="space-y-2">
							<Button intent="primary" onPress={handleRetry}>
								Try Again
							</Button>
							<p className="text-muted-fg text-xs">
								Make sure Hazel is running on your computer
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
