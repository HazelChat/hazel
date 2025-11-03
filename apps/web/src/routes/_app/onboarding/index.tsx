import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { useAuth } from "~/lib/auth"

export const Route = createFileRoute("/_app/onboarding/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useAuth()

	const { data: userOrganizations } = useLiveQuery(
		(q) =>
			q
				.from({ member: organizationMemberCollection })
				.innerJoin({ org: organizationCollection }, ({ member, org }) =>
					eq(member.organizationId, org.id),
				)
				.where(({ member }) => eq(member.userId, user?.id || ""))
				.orderBy(({ member }) => member.createdAt, "asc"),
		[user?.id],
	)

	if (userOrganizations && userOrganizations.length > 0) {
		const firstOrg = userOrganizations[0]!

		// If organization doesn't have a slug, redirect to setup
		if (!firstOrg.org.slug) {
			return <Navigate to="/onboarding/setup-organization" search={{ orgId: firstOrg.org.id }} />
		}

		return <Navigate to="/$orgSlug" params={{ orgSlug: firstOrg.org.slug }} />
	}

	return <div>Hello "/_app/onboarding/"!</div>
}
