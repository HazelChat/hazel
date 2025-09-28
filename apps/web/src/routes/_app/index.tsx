import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { Loader } from "~/components/loader"
import { organizationCollection } from "~/db/collections"
import { useAuth } from "~/providers/auth-provider"

export const Route = createFileRoute("/_app/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user, isLoading: isAuthLoading } = useAuth()

	const { data: organizations, isLoading } = useLiveQuery(
		(q) => {
			return q
				.from({
					organizatios: organizationCollection,
				})
				.where(({ organizatios }) => eq(organizatios.workosId, user?.workosOrganizationId))
				.orderBy(({ organizatios }) => organizatios.createdAt, "asc")
				.limit(1)
		},
		[user?.id, user?.workosOrganizationId],
	)

	if (isLoading || isAuthLoading) {
		return <Loader />
	}

	if (organizations && organizations.length > 0) {
		const orgId = organizations[0]?.id!
		return <Navigate to="/$orgId" params={{ orgId }} />
	}

	// Redirect to onboarding if user has no organization
	return <Navigate to="/onboarding" />
}
