import { Outlet, createRootRouteWithContext } from "@tanstack/solid-router"
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools"
import { ClerkProvider, SignIn, useAuth } from "clerk-solidjs"
import { Match, Show, Suspense, Switch, createEffect, createSignal, onCleanup } from "solid-js"
import { initZero } from "../lib/zero-client"
import { ZeroProvider } from "../lib/zero-context"

export const Route = createRootRouteWithContext()({
	component: RootComponent,
})

function AuthInner() {
	const { userId, isLoaded } = useAuth()

	return (
		<Switch>
			<Match when={!isLoaded()}>
				<p>Loading...</p>
			</Match>

			<Match when={isLoaded() && !userId()}>
				<div class="flex h-screen flex-col items-center justify-center">
					<SignIn />
				</div>
			</Match>

			<Match when={isLoaded() && userId()}>
				<ZeroInner />
			</Match>
		</Switch>
	)
}

function ZeroInner() {
	const { getToken, userId } = useAuth()

	const [zero, setZero] = createSignal<Awaited<ReturnType<typeof initZero>> | null>(null)

	createEffect(async () => {
		const currentUserId = userId()

		if (!currentUserId) {
			setZero(null)
			return
		}

		let isActive = true
		onCleanup(() => {
			isActive = false
		})

		try {
			// Call initZero, passing the current user ID and a function to get the token
			// This matches the original React structure where initZero receives a function
			const z = await initZero(currentUserId, () => getToken({ template: "ZeroSync" }).then((t) => t!))

			if (isActive) {
				setZero(z)
			}

			if (import.meta.env.DEV) {
				// @ts-ignore
				globalThis.zeroInspector = await z.inspect()
			}
		} catch (err) {
			console.error("failed to init zero:", err)
			if (isActive) {
				setZero(null)
			}
		}
	})

	return (
		<Show when={zero()} fallback={<p>Loading...</p>}>
			<ZeroProvider zero={zero()!}>
				<Suspense>
					<Outlet />
				</Suspense>
			</ZeroProvider>
		</Show>
	)
}

function RootComponent() {
	return (
		<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
			<AuthInner />
			<TanStackRouterDevtools />
		</ClerkProvider>
	)
}
