import { useAuth as useClerkAuth } from "@clerk/react"
import { createFileRoute, Outlet, useSearch } from "@tanstack/react-router"
import { Match, Option } from "effect"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import IconCheck from "~/components/icons/icon-check"
import IconCopy from "~/components/icons/icon-copy"
import { IconEnvelope } from "~/components/icons/icon-envelope"
import { Loader } from "~/components/loader"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { usePostHogIdentify } from "~/hooks/use-posthog-identify"
import { restartWebLogin, useAuth } from "~/lib/auth"
import { clerkReady } from "~/lib/clerk-token"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	loader: async () => {
		// Don't start Electric shape streams until Clerk is loaded and a
		// session exists. Preloading before hydration would hit the proxy with
		// no token and kill the stream on a synthetic 401.
		const clerk = await clerkReady()
		if (!clerk?.session) return null

		const {
			connectConversationChannelCollection,
			connectConversationCollection,
			connectParticipantCollection,
			organizationCollection,
			organizationMemberCollection,
		} = await import("~/db/collections")
		await Promise.all([
			organizationCollection.preload(),
			organizationMemberCollection.preload(),
			connectConversationCollection.preload(),
			connectConversationChannelCollection.preload(),
			connectParticipantCollection.preload(),
		])

		return null
	},
})

function RouteComponent() {
	const { user, error, isLoading } = useAuth()
	const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth()
	usePostHogIdentify()
	const search = useSearch({ from: "/_app" }) as {
		loginRetry?: string
	}
	const [copied, setCopied] = useState(false)

	const loginRetry = Number(search.loginRetry) || 0
	const currentReturnTo = `${location.pathname}${location.search}${location.hash}`

	// Redirect to Clerk sign-in only once Clerk has finished loading and
	// definitively reports not-signed-in. Guarded so re-renders (e.g. URL
	// changes while the redirect is in flight) don't fire a second redirect.
	// Also double-check the Clerk singleton — on return from sign-in, the
	// React `isSignedIn` hook can lag behind `window.Clerk.session` briefly.
	const redirectFiredRef = useRef(false)
	useEffect(() => {
		if (!clerkLoaded) return
		if (isSignedIn) return
		if (typeof window !== "undefined" && window.Clerk?.session) return
		if (redirectFiredRef.current) return
		redirectFiredRef.current = true
		void restartWebLogin({ returnTo: currentReturnTo })
	}, [currentReturnTo, clerkLoaded, isSignedIn])

	// Handle schema validation errors from Electric collections after deploys.
	// A stale cache can cause permanent decode failures — reload once to bust it.
	const schemaReloadAttemptedRef = useRef(false)
	useEffect(() => {
		const handleSchemaError = () => {
			if (schemaReloadAttemptedRef.current) return
			schemaReloadAttemptedRef.current = true
			console.warn("[layout] Collection schema error detected, reloading to bust stale cache")
			window.location.reload()
		}
		window.addEventListener("collection:schema-error", handleSchemaError)
		return () => window.removeEventListener("collection:schema-error", handleSchemaError)
	}, [])

	const handleCopyEmail = async () => {
		try {
			await navigator.clipboard.writeText("support@hazel.com")
			setCopied(true)
			toast.success("Email copied")
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error("Failed to copy email")
		}
	}

	// Show loader while loading
	if (isLoading && !user) {
		return <Loader />
	}

	// Check if we've exceeded retry limit
	if (loginRetry >= 3 && !user) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-6">
				<div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
					<h1 className="font-bold font-mono text-2xl text-danger">Too Many Login Attempts</h1>
					<Text>
						We've attempted to log you in multiple times without success. This might indicate a
						problem with the authentication service or your session.
					</Text>
					<div className="flex flex-col items-center gap-4">
						<div className="flex items-center gap-2 rounded-lg border border-border bg-overlay px-3 py-2">
							<IconEnvelope className="size-4 text-muted-fg" />
							<span className="font-mono text-sm">support@hazel.com</span>
							<Button
								intent="plain"
								size="sq-xs"
								onPress={handleCopyEmail}
								className="ml-1"
								aria-label="Copy email address"
							>
								{copied ? (
									<IconCheck className="size-4 text-success" />
								) : (
									<IconCopy className="size-4" />
								)}
							</Button>
						</div>
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
									window.location.href = "mailto:support@hazel.com?subject=Login%20Issues"
								}}
							>
								Send Email
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Handle authentication errors
	if (!user && Option.isSome(error)) {
		const errorValue = error.value
		const errorTag = errorValue._tag

		const serviceErrorScreen = (
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

		return Match.value(errorTag).pipe(
			// 503 errors - infrastructure/service issues - show error screen with retry
			Match.when("SessionLoadError", () => serviceErrorScreen),
			// 401 errors - user needs to re-authenticate - useEffect handles redirect
			Match.orElse(() => <Loader />),
		)
	}

	// No user and no error - useEffect handles redirect
	if (!user) {
		return <Loader />
	}

	return <Outlet />
}
