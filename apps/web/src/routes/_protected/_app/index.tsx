import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/solid-router"
import { createEffect, For } from "solid-js"
import { Card } from "~/components/ui/card"
import { convexQuery } from "~/lib/convex-query"

export const Route = createFileRoute("/_protected/_app/")({
	component: App,
	// beforeLoad: async ({ context }) => {
	// 	await context.convex.awaitAuth()

	// 	const res = await context.convex.query(api.me.getOrganization, {})

	// 	if (res.directive === "redirect") {
	// 		throw redirect({
	// 			to: res.to,
	// 		})
	// 	}

	// 	if (res.directive === "success") {
	// 		throw redirect({
	// 			to: "/app",
	// 		})
	// 	}
	// },
})

function App() {
	const navigate = useNavigate()
	const serversQuery = useQuery(() => convexQuery(api.servers.getServersForUser, {}))

	createEffect(() => {
		if (serversQuery.data?.length === 0) {
			navigate({
				to: "/onboarding",
			})
		}
	})

	return (
		<main class="container mx-auto flex w-full py-14">
			<div class="flex flex-row gap-3">
				<For each={serversQuery.data}>
					{(server) => (
						<Link to="/app">
							<Card>
								<Card.Header>
									<Card.Title>{server.name}</Card.Title>
								</Card.Header>
							</Card>
						</Link>
					)}
				</For>
			</div>
		</main>
	)
}
