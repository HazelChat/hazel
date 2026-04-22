import { SignUp } from "@clerk/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
	validateSearch: (
		search: Record<string, unknown>,
	): { returnTo?: string } => ({
		returnTo: search.returnTo as string | undefined,
	}),
})

export function SignUpPage() {
	const search = Route.useSearch()
	const forceRedirectUrl = search.returnTo || "/"

	return (
		<div className="flex min-h-screen items-center justify-center">
			<SignUp
				routing="hash"
				signInUrl="/auth/login"
				forceRedirectUrl={forceRedirectUrl}
			/>
		</div>
	)
}
