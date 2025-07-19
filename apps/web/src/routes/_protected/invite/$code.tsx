import { api } from "@hazel/backend/api"
import { createFileRoute } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"

import { IconSpinnerStroke } from "~/components/iconsv2"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { toaster } from "~/components/ui/toaster"
import { createMutation } from "~/lib/convex"

export const Route = createFileRoute("/_protected/invite/$code")({
	component: RouteComponent,
})

function RouteComponent() {
	const params = Route.useParams()
	const navigate = Route.useNavigate()

	const acceptInvite = createMutation(api.invites.acceptInvite)

	const [status, setStatus] = createSignal<"idle" | "loading" | "error">("idle")

	return (
		<div class="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
			<Card class="w-96 space-y-4">
				<Card.Header class="space-y-2 text-center">
					<Card.Title class="font-bold text-2xl">Join Server</Card.Title>
					<Card.Description>Accept the invitation to become part of this server.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col items-center gap-4">
					<Show when={status() === "idle"}>
						<Button
							class="w-full"
							disabled={status() === "loading"}
							onClick={async () => {
								setStatus("loading")
								try {
									const serverId = await acceptInvite({ code: params().code })
									navigate({ to: "/app" })
								} catch (err) {
									console.error(err)
									toaster.error({ title: "Failed to join", type: "error" })
									setStatus("error")
								}
							}}
						>
							Join Server
						</Button>
					</Show>

					<Show when={status() === "loading"}>
						<IconSpinnerStroke class="size-6 animate-spin" />
						<p>Joining...</p>
					</Show>

					<Show when={status() === "error"}>
						<p class="text-destructive">Failed to accept invite.</p>
					</Show>
				</Card.Content>
				<Show when={status() === "error"}>
					<Card.Footer class="justify-center">
						<Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
					</Card.Footer>
				</Show>
			</Card>
		</div>
	)
}
