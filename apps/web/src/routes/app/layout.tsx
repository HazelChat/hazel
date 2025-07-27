import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"
import { Authenticated, Unauthenticated } from "convex/react"
import { AppSidebar } from "~/components/app-sidebar/app-sidebar"
import { PresenceProvider } from "~/components/presence/presence-provider"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"

export const Route = createFileRoute("/app")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<Authenticated>
				<PresenceProvider>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset>
							<Outlet />
						</SidebarInset>
					</SidebarProvider>
				</PresenceProvider>
			</Authenticated>
			<Unauthenticated>
				<Navigate
					to="/auth/login"
					search={{
						returnTo: location.pathname,
					}}
				/>
			</Unauthenticated>
		</>
	)
}
