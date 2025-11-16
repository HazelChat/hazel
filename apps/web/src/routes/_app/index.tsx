import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { Loader } from "~/components/loader"
import { organizationCollection } from "~/db/collections"
import { useAuth } from "~/lib/auth"

export const Route = createFileRoute("/_app/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user, isLoading: isAuthLoading } = useAuth()

	const {
		data: organizations,
		isLoading,
		isReady,
	} = useLiveQuery(
		(q) => {
			return q
				.from({
					organizatios: organizationCollection,
				})
				.where(({ organizatios }) => eq(organizatios.id, user?.organizationId))
				.orderBy(({ organizatios }) => organizatios.createdAt, "asc")
				.findOne()
		},
		[user?.id, user?.organizationId],
	)

	if (isLoading || isAuthLoading || !isReady) {
		return <Loader />
	}

	// Let parent layout handle auth redirect
	if (!user) {
		return null
	}

	// Check if user has completed onboarding
	if (!user.isOnboarded) {
		const orgId = organizations?.id
		return <Navigate to="/onboarding" search={orgId ? { orgId } : undefined} />
	}

	// User is onboarded, check their organization
	if (organizations) {
		const org = organizations

		if (!org.slug) {
			return <Navigate to="/onboarding" search={{ orgId: org.id }} />
		}

		return <Navigate to="/$orgSlug" params={{ orgSlug: org.slug }} />
	}

	// User is onboarded but has no organization - shouldn't happen, but redirect to onboarding
	return <Navigate to="/onboarding" />
}
