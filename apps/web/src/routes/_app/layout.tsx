import { useAuth as useClerkAuth, ClerkLoaded, ClerkLoading, RedirectToSignIn } from "@clerk/react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Option } from "effect"
import { useEffect, useRef } from "react"
import { Loader } from "~/components/loader"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { usePostHogIdentify } from "~/hooks/use-posthog-identify"
import { useAuth } from "~/lib/auth"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
})

function RouteComponent() {
	const currentUrl = `${location.pathname}${location.search}${location.hash}`

	return (
		<>
			<ClerkLoading>
				<Loader />
			</ClerkLoading>
			<ClerkLoaded>
				<Gate currentUrl={currentUrl} />
			</ClerkLoaded>
		</>
	)
}

function Gate({ currentUrl }: { currentUrl: string }) {
	// `treatPendingAsSignedOut: false` — users with pending Clerk tasks (org
	// selection, MFA, etc.) count as signed in so they can reach our own
	// /onboarding + /select-organization routes. Default `true` caused a
	// RedirectToSignIn ↔ Clerk hosted sign-in loop.
	const { isSignedIn } = useClerkAuth({ treatPendingAsSignedOut: false })
	if (!isSignedIn) return <RedirectToSignIn redirectUrl={currentUrl} />
	return <AppShell />
}

function AppShell() {
	const { user, error, isLoading } = useAuth()
	usePostHogIdentify()

	const preloadStartedRef = useRef(false)
	useEffect(() => {
		if (preloadStartedRef.current) return
		preloadStartedRef.current = true
		void import("~/db/collections").then((m) =>
			Promise.all([
				m.organizationCollection.preload(),
				m.organizationMemberCollection.preload(),
				m.connectConversationCollection.preload(),
				m.connectConversationChannelCollection.preload(),
				m.connectParticipantCollection.preload(),
			]).catch((err) => console.warn("[layout] collection preload error", err)),
		)
	}, [])

	const schemaReloadAttemptedRef = useRef(false)
	useEffect(() => {
		const onError = () => {
			if (schemaReloadAttemptedRef.current) return
			schemaReloadAttemptedRef.current = true
			console.warn("[layout] Collection schema error detected, reloading to bust stale cache")
			window.location.reload()
		}
		window.addEventListener("collection:schema-error", onError)
		return () => window.removeEventListener("collection:schema-error", onError)
	}, [])

	if (isLoading && !user) return <Loader />

	if (!user && Option.isSome(error)) {
		const errorValue = error.value
		if (errorValue._tag === "SessionLoadError") {
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
		return <Loader />
	}

	if (!user) return <Loader />

	return <Outlet />
}
