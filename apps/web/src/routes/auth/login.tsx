import type { OrganizationId } from "@hazel/schema"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Loader } from "~/components/ui/loader"
import { getWebLoginAttemptKey, startWebLoginRedirectOnce } from "~/lib/web-login-single-flight"
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

export function LoginPage() {
	const { user, login, isLoading } = useAuth()
	const search = Route.useSearch()
	const loginAttemptKey = getWebLoginAttemptKey({
		returnTo: search.returnTo || "/",
		organizationId: search.organizationId,
		invitationToken: search.invitationToken,
	})

	// Initiate login in useEffect when conditions are met
	useEffect(() => {
		if (!user && !isLoading) {
			startWebLoginRedirectOnce(loginAttemptKey, () =>
				login({
					returnTo: search.returnTo || "/",
					organizationId: search.organizationId as OrganizationId | undefined,
					invitationToken: search.invitationToken,
				}),
			)
		}
	}, [user, isLoading, login, loginAttemptKey])

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
