import { createFileRoute, Outlet, useRouter, useSearch } from "@tanstack/react-router"
import { Match, Option } from "effect"
import { useState } from "react"
import { toast } from "sonner"
import IconCheck from "~/components/icons/icon-check"
import IconCopy from "~/components/icons/icon-copy"
import { IconEnvelope } from "~/components/icons/icon-envelope"
import { Loader } from "~/components/loader"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { usePostHogIdentify } from "~/hooks/use-posthog-identify"
import { useAuth } from "~/lib/auth"
import { isTauri } from "~/lib/tauri"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	loader: async () => {
		await organizationCollection.preload()
		await organizationMemberCollection.preload()

		return null
	},
})

function RouteComponent() {
	const { user, error, isLoading, login } = useAuth()
	const router = useRouter()
	usePostHogIdentify()
	const search = useSearch({ from: "/_app" }) as {
		loginRetry?: string
	}
	const [copied, setCopied] = useState(false)

	const loginRetry = Number(search.loginRetry) || 0

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
							<button
								type="button"
								onClick={handleCopyEmail}
								className="ml-1 rounded p-1 text-muted-fg transition-colors hover:bg-secondary hover:text-fg"
								aria-label="Copy email address"
							>
								{copied ? (
									<IconCheck className="size-4 text-success" />
								) : (
									<IconCopy className="size-4" />
								)}
							</button>
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
			Match.when("WorkOSUserFetchError", () => serviceErrorScreen),
			// 401 errors - user needs to re-authenticate - redirect to login
			Match.orElse(() => {
				if (isTauri()) {
					// Tauri desktop: show login screen instead of auto-redirect
					router.navigate({ to: "/auth/desktop-login" })
				} else {
					// Web: auto-redirect to backend login
					login({ returnTo: `${location.pathname}${location.search}${location.hash}` })
				}
				return <Loader />
			}),
		)
	}

	// No user and no error - redirect to login
	if (!user) {
		if (isTauri()) {
			// Tauri desktop: show login screen instead of auto-redirect
			router.navigate({ to: "/auth/desktop-login" })
		} else {
			// Web: auto-redirect to backend login
			login({ returnTo: `${location.pathname}${location.search}${location.hash}` })
		}
		return <Loader />
	}

	return <Outlet />
}
