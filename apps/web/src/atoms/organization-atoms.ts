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
