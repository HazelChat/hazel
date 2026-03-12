import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

export const workspaceSearchMutation = HazelRpcClient.mutation("connectShare.workspace.search")
export const createConnectInviteMutation = HazelRpcClient.mutation("connectShare.invite.create")
export const acceptConnectInviteMutation = HazelRpcClient.mutation("connectShare.invite.accept")
export const declineConnectInviteMutation = HazelRpcClient.mutation("connectShare.invite.decline")
export const revokeConnectInviteMutation = HazelRpcClient.mutation("connectShare.invite.revoke")
export const disconnectConnectOrgMutation = HazelRpcClient.mutation("connectShare.organization.disconnect")
export const updateConnectSettingsMutation = HazelRpcClient.mutation("connectShare.settings.update")
