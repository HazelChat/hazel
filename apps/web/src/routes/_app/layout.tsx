import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"
import { useAuth } from "~/providers/auth-provider"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user, isLoading } = useAuth()
	return (
		<>
			{!user && !isLoading && (
				<Navigate
					to="/auth/login"
					search={{
						returnTo: location.pathname,
					}}
				/>
			)}
			<Outlet />
		</>
	)
}
