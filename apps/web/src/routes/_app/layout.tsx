import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { Option } from "effect"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { type AuthError, waitForAuth } from "~/lib/wait-for-auth"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	loader: async ({ location }) => {
		// Wait for auth to settle
		const { user, error } = await waitForAuth()

		// Get loginRetry from search params
		const searchParams = new URLSearchParams(location.search)
		const loginRetry = Number(searchParams.get("loginRetry")) || 0

		// Handle no user cases in loader
		if (!user) {
			// Check for 503-type errors that should show error screen (not redirect)
			if (Option.isSome(error)) {
				const errorTag = (error.value as AuthError)._tag
				if (
					errorTag === "SessionLoadError" ||
					errorTag === "SessionRefreshError" ||
					errorTag === "WorkOSUserFetchError"
				) {
					// Return error to component for error screen display
					return { user: null, error, loginRetry }
				}
			}

			// Check retry limit
			if (loginRetry >= 3) {
				return { user: null, error, loginRetry }
			}

			// Redirect to login for 401-type errors or no error
			const currentUrl = new URL(location.href, window.location.origin)
			currentUrl.searchParams.set("loginRetry", String(loginRetry + 1))
			const returnTo = encodeURIComponent(currentUrl.pathname + currentUrl.search + currentUrl.hash)
			const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
			throw redirect({ href: `${backendUrl}/auth/login?returnTo=${returnTo}` })
		}

		// Preload collections after auth is confirmed
		await organizationCollection.preload()
		await organizationMemberCollection.preload()

		return { user, error, loginRetry }
	},
})

function RouteComponent() {
	const { user, error, loginRetry } = Route.useLoaderData()

	// Check if we've exceeded retry limit (loader passes this through)
	if (loginRetry >= 3 && !user) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-6">
				<div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
					<h1 className="font-bold font-mono text-2xl text-danger">Too Many Login Attempts</h1>
					<Text>
						We've attempted to log you in multiple times without success. This might indicate a
						problem with the authentication service or your session.
					</Text>
					<div className="flex gap-3">
						<Button
							intent="primary"
							onPress={() => {
								const url = new URL(window.location.href)
								url.searchParams.delete("loginRetry")
								window.location.href = url.toString()
							}}
						>
							Try Again
						</Button>
						<Button
							intent="secondary"
							onPress={() => {
								window.location.href = "mailto:support@example.com?subject=Login%20Issues"
							}}
						>
							Contact Support
						</Button>
					</div>
				</div>
			</div>
		)
	}

	// Handle 503-type authentication errors (loader passes these through)
	if (!user && Option.isSome(error)) {
		const errorValue = error.value as AuthError

		return (
			<div className="flex h-screen flex-col items-center justify-center gap-6">
				<div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
					<h1 className="font-bold font-mono text-2xl text-danger">
						Service Temporarily Unavailable
					</h1>
					<Text>
						We're having trouble connecting to the authentication service. This is usually
						temporary.
					</Text>
					<Text className="text-muted-fg text-xs">{errorValue.message}</Text>
					<Button intent="primary" onPress={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</div>
		)
	}

	return <Outlet />
}
