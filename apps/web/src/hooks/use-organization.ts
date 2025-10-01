import { eq, useLiveQuery } from "@tanstack/react-db"
import { useParams } from "@tanstack/react-router"
import { organizationCollection } from "~/db/collections"

/**
 * Hook to get the current organization from the route slug
 * Returns the full organization object and its ID
 *
 * @returns Organization data, ID, loading state, and slug from params
 */
export function useOrganization() {
	const params = useParams({ strict: false })
	const orgSlug = params.orgSlug as string | undefined

	const { data, isLoading } = useLiveQuery(
		(q) =>
			orgSlug
				? q
						.from({ org: organizationCollection })
						.where(({ org }) => eq(org.slug, orgSlug))
						.orderBy(({ org }) => org.createdAt, "asc")
						.limit(1)
				: null,
		[orgSlug],
	)

	const organization = data?.[0]

	return {
		organization,
		organizationId: organization?.id,
		isLoading,
		slug: orgSlug,
	}
}
