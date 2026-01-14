import { TanStackDevtools } from "@tanstack/react-devtools"
import {
	createRootRouteWithContext,
	type NavigateOptions,
	Outlet,
	type ToOptions,
	useRouter,
} from "@tanstack/react-router"
import { RpcDevtoolsPanel } from "effect-rpc-tanstack-devtools/components"
import { lazy, Suspense } from "react"
import { RouterProvider } from "react-aria-components"

// PWA version check - only loaded for web builds (Tauri has its own update mechanism via TauriUpdateCheck)
// Using if-statement for proper dead-code elimination in Tauri builds
let VersionCheck: ReturnType<typeof lazy<React.FC>> | null = null
if (!import.meta.env.TAURI_ENV_PLATFORM) {
	VersionCheck = lazy(() => import("~/components/version-check").then((m) => ({ default: m.VersionCheck })))
}

export const Route = createRootRouteWithContext<{}>()({
	component: () => {
		const router = useRouter()

		return (
			<RouterProvider
				navigate={(href, opts) => router.navigate({ ...href, ...opts })}
				useHref={(href) => {
					const location = router.buildLocation(typeof href === "string" ? { to: href } : href)
					return location.href ?? "#"
				}}
			>
				{/* {import.meta.env.DEV && (
					<TanStackDevtools
						plugins={[
							{
								name: "Effect RPC",
								render: <RpcDevtoolsPanel />,
							},
						]}
					/>
				)} */}
				<Outlet />
				{import.meta.env.PROD && !import.meta.env.TAURI_ENV_PLATFORM && VersionCheck && (
					<Suspense fallback={null}>
						<VersionCheck />
					</Suspense>
				)}
			</RouterProvider>
		)
	},
})
