import { SignIn } from "@clerk/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: (
		search: Record<string, unknown>,
	): {
		returnTo?: string
		organizationId?: string
		invitationToken?: string
	} => ({
		returnTo: search.returnTo as string | undefined,
		organizationId: search.organizationId as string | undefined,
		invitationToken: search.invitationToken as string | undefined,
	}),
})

export function LoginPage() {
	const search = Route.useSearch()
	const forceRedirectUrl = search.returnTo || "/"

	return (
		<div className="flex min-h-screen items-center justify-center">
			{/* routing="hash" avoids needing a splat route in the TanStack file tree —
			    Clerk's multi-step flow (factor-one, factor-two, SSO callback, …) uses
			    URL fragments instead of sub-paths. */}
			<SignIn
				routing="hash"
				signUpUrl="/auth/sign-up"
				forceRedirectUrl={forceRedirectUrl}
			/>
		</div>
	)
}
