import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"

import { useQuery, useQueryClient } from "@tanstack/solid-query"
import { createFileRoute, Outlet } from "@tanstack/solid-router"
import { createEffect, Suspense } from "solid-js"
import { CommandBar } from "~/components/command-bar/command-bar"
import { Sidebar } from "~/components/ui/sidebar"
import { PresenceProvider } from "~/lib/convex-presence"
import { convexQuery } from "~/lib/convex-query"
import { setCurrentServerId } from "~/lib/helpers/localstorage"
import { AppSidebar } from "./-components/sidebar/app-sidebar"

export const Route = createFileRoute("/_protected/_app/app")({
	component: RouteComponent,
	loader: ({ context: { queryClient } }) =>
		queryClient
			.ensureQueryData(
				convexQuery(api.channels.getChannelsForOrganization, {
					favoriteFilter: {
						favorite: false,
					},
				}),
			)
			.catch(() => undefined),
})

function RouteComponent() {
	const queryClient = useQueryClient()
	const navigate = Route.useNavigate()

	const serverQuery = useQuery(() => convexQuery(api.servers.getCurrentServer, {}))

	const meQuery = useQuery(() => convexQuery(api.me.getCurrentUser, {}))

	createEffect(async () => {
		await Promise.all([
			queryClient.prefetchQuery(convexQuery(api.servers.getCurrentServer, {})),
			queryClient.prefetchQuery(convexQuery(api.me.getCurrentUser, {})),
			queryClient.prefetchQuery(convexQuery(api.me.get, {})),
			queryClient.prefetchQuery(
				convexQuery(api.channels.getChannelsForOrganization, {
					favoriteFilter: {
						favorite: false,
					},
				}),
			),
		])
	})

	createEffect(() => {
		if (serverQuery.isPending) {
			return
		}

		if (!serverQuery.data || serverQuery.error) {
			throw navigate({
				to: "/",
			})
		}

		setCurrentServerId(serverQuery.data._id)
	})

	return (
		<Suspense>
			<PresenceProvider
				roomId={() => serverQuery.data?._id as Id<"servers">}
				userId={() => meQuery.data?._id!}
			>
				<CommandBar />
				<Sidebar.Provider>
					<AppSidebar />
					<Sidebar.Inset>
						<Outlet />
					</Sidebar.Inset>
				</Sidebar.Provider>
			</PresenceProvider>
		</Suspense>
	)
}
