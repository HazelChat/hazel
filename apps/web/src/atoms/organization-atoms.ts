import { Atom } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Mutation atom for creating organizations
 */
export const createOrganizationMutation = HazelRpcClient.mutation("organization.create")

/**
 * Mutation atom for updating organizations
 */
export const updateOrganizationMutation = HazelRpcClient.mutation("organization.update")

/**
 * Mutation atom for deleting organizations
 */
export const deleteOrganizationMutation = HazelRpcClient.mutation("organization.delete")

/**
 * Mutation atom for setting organization slug
 */
export const setOrganizationSlugMutation = HazelRpcClient.mutation("organization.setSlug")

/**
 * Mutation atom for updating organization member metadata
 */
export const updateOrganizationMemberMetadataMutation = HazelRpcClient.mutation(
	"organizationMember.updateMetadata",
)

/**
 * Mutation atom for setting organization public mode
 */
export const setPublicModeMutation = HazelRpcClient.mutation("organization.setPublicMode")

/**
 * Query atom factory for getting public organization info by slug
 */
export const getOrgBySlugPublicQuery = (slug: string) =>
	HazelRpcClient.query("organization.getBySlugPublic", { slug })

/**
 * Mutation atom for joining an organization via public invite
 */
export const joinViaPublicInviteMutation = HazelRpcClient.mutation("organization.joinViaPublicInvite")

/**
 * Mutation atom for getting the WorkOS Admin Portal link
 */
export const getAdminPortalLinkMutation = HazelRpcClient.mutation("organization.getAdminPortalLink")

/**
 * Polling signal atom that emits every 15 seconds for domain verification.
 * Uses setInterval with get.setSelf pattern similar to windowFocusSignal.
 * Auto-disposes when no components are subscribed.
 */
export const domainPollingSignal = Atom.readable<number>((get) => {
	let count = 0
	const intervalId = setInterval(() => {
		get.setSelf(++count)
	}, 15_000)
	get.addFinalizer(() => {
		clearInterval(intervalId)
	})
	return count
})

/**
 * Query atom factory for listing organization domains.
 * Auto-polls every 15 seconds to detect when pending domains become verified.
 * Polling stops automatically when the user navigates away from the page.
 */
export const listOrganizationDomainsQuery = (organizationId: OrganizationId) =>
	HazelRpcClient.query(
		"organization.listDomains",
		{ id: organizationId },
		{
			reactivityKeys: [`organizationDomains:${organizationId}`],
		},
	).pipe(Atom.makeRefreshOnSignal(domainPollingSignal))

/**
 * Mutation atom for adding a domain to an organization
 */
export const addOrganizationDomainMutation = HazelRpcClient.mutation("organization.addDomain")

/**
 * Mutation atom for removing a domain from an organization
 */
export const removeOrganizationDomainMutation = HazelRpcClient.mutation("organization.removeDomain")
