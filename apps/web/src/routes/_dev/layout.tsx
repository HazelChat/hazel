import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_dev")({
	beforeLoad: () => {
		// Only allow access in development mode
		if (import.meta.env.PROD) {
			throw redirect({ to: "/" })
		}
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="min-h-screen bg-canvas">
			<header className="border-border border-b bg-surface px-4 py-3">
				<div className="flex items-center gap-3">
					<span className="rounded bg-warning/20 px-2 py-1 font-mono text-warning text-xs">
						DEV
					</span>
					<h1 className="font-semibold text-lg">Component Playground</h1>
				</div>
			</header>
			<main className="p-6">
				<Outlet />
			</main>
		</div>
	)
}
