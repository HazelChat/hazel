import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/onboarding/setup-organization")({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_app/onboarding/setup-organization"!</div>
}
