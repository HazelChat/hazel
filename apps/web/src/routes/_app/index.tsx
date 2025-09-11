import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { useUser } from "~/lib/auth"

export const Route = createFileRoute("/_app/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useUser()

	// Get the user's first organization through organization members
	const { data: orgMembers, isLoading } = useLiveQuery(
		(q) =>
			q
				.from({ member: organizationMemberCollection })
				.innerJoin({ org: organizationCollection }, ({ member, org }) =>
					eq(member.organizationId, org.id),
				)
				.where(({ member }) => eq(member.userId, user?.id || ""))
				.orderBy(({ member }) => member.createdAt, "asc")
				.limit(1),
		[user?.id],
	)

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
			</div>
		)
	}

	if (orgMembers && orgMembers.length > 0) {
		const orgId = orgMembers[0]!.org.id
		return <Navigate to="/$orgId" params={{ orgId }} />
	}

	// Redirect to onboarding if user has no organization
	return <Navigate to="/onboarding" />
}
