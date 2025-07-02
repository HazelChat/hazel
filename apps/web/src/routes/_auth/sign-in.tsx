import { createFileRoute } from "@tanstack/solid-router"
import { type } from "arktype"
import { SignIn } from "clerk-solidjs"

export const Route = createFileRoute("/_auth/sign-in")({
	component: RouteComponent,
	validateSearch: type({
		"redirectTo?": "string",
	}),
})

function RouteComponent() {
	const search = Route.useSearch()
	return <SignIn fallbackRedirectUrl={search().redirectTo} />
}
