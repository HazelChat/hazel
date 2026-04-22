import { CreateOrganization } from "@clerk/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/onboarding/setup-organization")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-bg p-4">
			<CreateOrganization
				routing="hash"
				skipInvitationScreen
				afterCreateOrganizationUrl="/"
			/>
		</div>
	)
}
