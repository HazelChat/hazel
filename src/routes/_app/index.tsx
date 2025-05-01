import { Link, createFileRoute } from "@tanstack/solid-router"
import { For, Show } from "solid-js"
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { useUserServers } from "~/lib/hooks/data/use-user-servers"

export const Route = createFileRoute("/_app/")({
	component: App,
})

function App() {
	const { servers } = useUserServers()

	return (
		<main class="container mx-auto flex w-full py-14">
			<div class="flex flex-row gap-3">
				<For each={servers()}>
					{(server) => (
						<Link to="/$serverId" params={{ serverId: server.id }}>
							<Card>
								<CardHeader>
									<CardTitle>{server.name}</CardTitle>
									<CardDescription>{server.owner?.displayName}</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					)}
				</For>
			</div>
		</main>
	)
}
