/**
 * @module Desktop OAuth callback page
 * @platform web (opened in browser during desktop OAuth)
 * @description Receives OAuth callback from WorkOS and forwards to desktop app's local server
 */

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { DesktopAuthState } from "@hazel/domain/http"
import { createFileRoute } from "@tanstack/react-router"
import { Schema } from "effect"
import { useMemo } from "react"
import {
	copyCallbackToClipboardAtom,
	createCallbackInitAtom,
	desktopCallbackStatusAtom,
	retryCallbackAtom,
} from "~/atoms/desktop-callback-atoms"
import { Logo } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"

// Schema for search params - state is already parsed by TanStack Router's JSON handling
const RawSearchParams = Schema.Struct({
	code: Schema.optional(Schema.String),
	state: Schema.optional(DesktopAuthState),
	error: Schema.optional(Schema.String),
	error_description: Schema.optional(Schema.String),
})

export const Route = createFileRoute("/auth/desktop-callback")({
	component: DesktopCallbackPage,
	validateSearch: (search: Record<string, unknown>) => Schema.decodeUnknownSync(RawSearchParams)(search),
})

function DesktopCallbackPage() {
	const search = Route.useSearch()
	const status = useAtomValue(desktopCallbackStatusAtom)

	// Create and mount init atom - triggers callback automatically when mounted
	const initAtom = useMemo(() => createCallbackInitAtom(search), [search])
	useAtomValue(initAtom)

	// Get action atom setters
	const retryCallback = useAtomSet(retryCallbackAtom)
	const copyToClipboard = useAtomSet(copyCallbackToClipboardAtom)

	function handleRetry() {
		retryCallback(search)
	}

	function handleCopyToClipboard() {
		copyToClipboard(search)
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg">
			<div className="flex max-w-md flex-col items-center gap-6 px-4 text-center">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<Logo className="size-12" />
					<span className="font-semibold text-3xl">Hazel</span>
				</div>

				{(status._tag === "idle" || status._tag === "connecting") && (
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
							<p className="text-muted-fg text-sm">
								You can close this tab and return to Hazel
							</p>
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
							<h1 className="font-semibold text-xl">Connection Failed</h1>
							<p className="text-muted-fg text-sm">{status.message}</p>
						</div>
						{status.isRetryable && (
							<div className="space-y-3">
								<div className="flex flex-col gap-2">
									<Button intent="primary" onPress={handleRetry}>
										Try Again
									</Button>
									{status.isConnectionError && (
										<Button intent="secondary" onPress={handleCopyToClipboard}>
											Copy to clipboard
										</Button>
									)}
								</div>
								<p className="text-muted-fg text-xs">
									{status.isConnectionError
										? "If automatic connection keeps failing, copy your auth code and paste it in the desktop app"
										: "Make sure Hazel is running on your computer"}
								</p>
							</div>
						)}
					</div>
				)}

				{status._tag === "copied" && (
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
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
								/>
							</svg>
						</div>
						<div className="space-y-2">
							<h1 className="font-semibold text-xl">Copied to Clipboard</h1>
							<p className="text-muted-fg text-sm">{status.message}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
