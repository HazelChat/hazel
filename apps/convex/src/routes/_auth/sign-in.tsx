import { createFileRoute } from "@tanstack/solid-router"
import { SignIn } from "clerk-solidjs"

export const Route = createFileRoute("/_auth/sign-in")({
	component: RouteComponent,
})

function RouteComponent() {
	return <SignIn />
}
