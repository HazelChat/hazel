import type { Organization } from "@hazel/db/schema"

/**
 * Safely get the navigation route for an organization
 * Handles missing slugs by redirecting to setup page
 *
 * @param org - Organization object with id and slug
 * @param subPath - Optional subpath (e.g., "chat", "settings/team")
 * @returns Navigation object for TanStack Router
 */
export function getOrganizationRoute(
	org: Pick<Organization, "id" | "slug">,
	subPath?: string,
): { to: string; params?: Record<string, string>; search?: Record<string, string> } {
	// If org doesn't have a slug, redirect to setup
	if (!org.slug) {
		return {
			to: "/onboarding/setup-organization",
			search: { orgId: org.id },
		}
	}

	// Build the route with slug
	const base = `/${org.slug}`
	const to = subPath ? `${base}/${subPath}` : base

	return { to }
}
