/**
 * @module Desktop login page
 * @platform desktop
 * @description Login page for desktop app that initiates OAuth flow via system browser
 */

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router"
import {
	desktopAuthErrorAtom,
	desktopAuthStatusAtom,
	desktopLoginAtom,
	desktopLoginFromClipboardAtom,
	getDesktopAccessToken,
} from "~/atoms/desktop-auth"
import { Logo } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { isDesktopRuntime } from "~/lib/desktop-runtime"

export const Route = createFileRoute("/auth/desktop-login")({
	// Check for existing token before rendering - redirect to home if already logged in
	loader: async () => {
		if (!isDesktopRuntime()) return null

		const token = await getDesktopAccessToken()
		if (token && token.trim().length > 10) {
			throw redirect({ to: "/" })
		}
		return null
	},
	component: DesktopLoginPage,
})

function DesktopLoginPage() {
	const authStatus = useAtomValue(desktopAuthStatusAtom)
	const authError = useAtomValue(desktopAuthErrorAtom)
	const login = useAtomSet(desktopLoginAtom)
	const loginFromClipboard = useAtomSet(desktopLoginFromClipboardAtom)

	// Redirect web users to regular login
	if (!isDesktopRuntime()) {
		return <Navigate to="/auth/login" />
	}

	const isLoading = authStatus === "loading"
	const error = authError?.message ?? null

	const handleLogin = () => {
		login({ returnTo: "/" })
	}

	const handlePasteFromClipboard = () => {
		loginFromClipboard()
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg">
			<div className="flex flex-col items-center gap-6 px-4 text-center">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<Logo className="size-12" />
					<span className="font-semibold text-3xl">Hazel</span>
				</div>

				{/* Title */}
				<div className="space-y-2">
					<h1 className="font-semibold text-2xl">Welcome back</h1>
					<p className="text-muted-fg">Sign in to continue to Hazel</p>
				</div>

				{/* Login button */}
				<Button
					intent="primary"
					size="lg"
					onPress={handleLogin}
					isDisabled={isLoading}
					className="w-full max-w-xs"
				>
					{isLoading ? "Opening browser..." : "Login with Hazel"}
				</Button>

				{/* Error message */}
				{error && <p className="text-danger text-sm">{error}</p>}

				{/* Footer */}
				<p className="text-muted-fg text-xs">Opens in your default browser</p>

				{/* Clipboard fallback */}
				<div className="mt-4 border-t border-border pt-4">
					<p className="mb-2 text-muted-fg text-xs">Having trouble connecting?</p>
					<Button
						intent="plain"
						size="sm"
						onPress={handlePasteFromClipboard}
						isDisabled={isLoading}
					>
						Paste from clipboard
					</Button>
				</div>
			</div>
		</div>
	)
}
