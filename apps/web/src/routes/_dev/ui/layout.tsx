import { createFileRoute, Link, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_dev/ui")({
	component: RouteComponent,
})

const uiComponents = [{ name: "Agent Steps", path: "/ui/agent-steps" }] as const

function RouteComponent() {
	return (
		<div className="flex gap-6">
			<nav className="w-48 shrink-0">
				<h2 className="mb-3 font-medium text-muted-fg text-sm">Components</h2>
				<ul className="space-y-1">
					{uiComponents.map((component) => (
						<li key={component.path}>
							<Link
								to={component.path}
								className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50 [&.active]:bg-accent/10 [&.active]:text-accent-fg"
							>
								{component.name}
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<div className="min-w-0 flex-1">
				<Outlet />
			</div>
		</div>
	)
}
