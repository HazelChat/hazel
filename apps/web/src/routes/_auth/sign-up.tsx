import { createFileRoute } from "@tanstack/solid-router"
import { type } from "arktype"
import { SignUp } from "clerk-solidjs"

export const Route = createFileRoute("/_auth/sign-up")({
	component: RouteComponent,
	validateSearch: type({
		"redirectTo?": "string",
	}),
})

function RouteComponent() {
	const search = Route.useSearch()
	return <SignUp fallbackRedirectUrl={search().redirectTo} />
}
