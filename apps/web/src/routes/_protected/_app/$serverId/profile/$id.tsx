import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createMemo } from "solid-js"
import { Badge } from "~/components/ui/badge"
import { Card } from "~/components/ui/card"
import { UserAvatar } from "~/components/ui/user-avatar"
import { usePresenceState } from "~/lib/convex-presence"
import { convexQuery } from "~/lib/convex-query"

export const Route = createFileRoute("/_protected/_app/$serverId/profile/$id")({
	component: RouteComponent,
})

function RouteComponent() {
	const params = Route.useParams()
	const nav = useNavigate()
	const userQuery = useQuery(() =>
		convexQuery(api.users.getUser, {
			userId: params().id as Id<"users">,
			serverId: params().serverId as Id<"servers">,
		}),
	)

	const presence = usePresenceState()

	const status = createMemo(() => {
		const item = presence.presenceList().find((presence) => {
			if (presence.userId === userQuery.data?._id) {
				return true
			}
		})

		if (!item) {
			return "offline"
		}

		return item.online ? "online" : "offline"
	})

	return (
		<div class="container px-6 py-12">
			<Card class="flex flex-row gap-4 p-3">
				<UserAvatar
					class="size-12"
					status={status()}
					avatarUrl={userQuery.data?.avatarUrl!}
					displayName={userQuery.data?.displayName!}
				/>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="font-bold text-2xl">{userQuery.data?.displayName}</h1>
						<Badge>he/him</Badge>
					</div>
					<p class="text-muted-foreground">{userQuery.data?.tag}</p>
				</div>
			</Card>
		</div>
	)
}
