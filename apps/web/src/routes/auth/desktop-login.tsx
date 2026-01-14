/**
 * @module Desktop login page
 * @platform desktop
 * @description Login page for desktop app that initiates OAuth flow via system browser
 */

import { createFileRoute, Navigate, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { Logo } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { isTauri } from "~/lib/tauri"
import { initiateDesktopAuth } from "~/lib/tauri-auth"
import { getAccessToken } from "~/lib/token-storage"

export const Route = createFileRoute("/auth/desktop-login")({
	// Check for existing token before rendering - redirect to home if already logged in
	loader: async () => {
		if (!isTauri()) return null

		const token = await getAccessToken()
		if (token && token.trim().length > 10) {
			throw redirect({ to: "/" })
		}
		return null
	},
	component: DesktopLoginPage,
})

function DesktopLoginPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Redirect web users to regular login
	if (!isTauri()) {
		return <Navigate to="/auth/login" />
	}

	const handleLogin = async () => {
		setIsLoading(true)
		setError(null)
		try {
			await initiateDesktopAuth({ returnTo: "/" })
		} catch (e) {
			setError(e instanceof Error ? e.message : "Login failed")
			setIsLoading(false)
		}
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
			</div>
		</div>
	)
}
