import { useNavigate } from "@tanstack/solid-router"
import { For } from "solid-js"
import { Avatar } from "~/components/ui/avatar"
import { useUserServers } from "~/lib/hooks/data/use-user-servers"

export const ServerSelectSidebar = () => {
	const { servers } = useUserServers()

	const navigate = useNavigate()

	return (
		<ul class="flex flex-col gap-3 px-2 py-1">
			<For each={servers()}>
				{(server) => (
					<Avatar
						class="cursor-pointer"
						name={server.name}
						src={server.imageUrl}
						onClick={() =>
							navigate({
								to: "/$serverId",
								params: { serverId: server.id },
							})
						}
					/>
				)}
			</For>
		</ul>
	)
}
