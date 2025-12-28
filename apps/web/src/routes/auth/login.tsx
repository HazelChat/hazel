import type { OrganizationId } from "@hazel/schema"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useRef } from "react"
import { Loader } from "~/components/ui/loader"
import { useAuth } from "../../lib/auth"

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: (
		search: Record<string, unknown>,
	): {
		returnTo?: string
		organizationId?: string
		invitationToken?: string
	} => {
		return {
			returnTo: search.returnTo as string | undefined,
			organizationId: search.organizationId as string | undefined,
			invitationToken: search.invitationToken as string | undefined,
		}
	},
})

function LoginPage() {
	const { user, login, isLoading } = useAuth()
	const search = Route.useSearch()

	// Use ref to track if login was initiated - avoids useEffect with complex conditionals
	const hasInitiatedLogin = useRef(false)

	// Initiate login during render when conditions are met (not in useEffect)
	if (!user && !isLoading && !hasInitiatedLogin.current) {
		hasInitiatedLogin.current = true
		login({
			returnTo: search.returnTo || "/",
			organizationId: search.organizationId as OrganizationId | undefined,
			invitationToken: search.invitationToken,
		})
	}

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader className="size-8" />
			</div>
		)
	}

	if (user) {
		return <Navigate to={search.returnTo || "/"} />
	}

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 font-semibold text-2xl">Redirecting to login...</h1>
				<Loader className="mx-auto size-8" />
			</div>
		</div>
	)
}
