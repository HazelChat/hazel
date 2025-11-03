import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Mutation atom for resending invitations
 */
export const resendInvitationMutation = HazelRpcClient.mutation("invitation.resend")

/**
 * Mutation atom for revoking invitations
 */
export const revokeInvitationMutation = HazelRpcClient.mutation("invitation.revoke")

/**
 * Mutation atom for creating invitations
 */
export const createInvitationMutation = HazelRpcClient.mutation("invitation.create")
