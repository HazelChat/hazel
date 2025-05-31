import { createFileRoute } from "@tanstack/solid-router"
import { SignUp } from "clerk-solidjs"

export const Route = createFileRoute("/_auth/sign-up")({
	component: RouteComponent,
})

function RouteComponent() {
	return <SignUp />
}
