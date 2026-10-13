import { InvitationRpcs } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { Invitations } from "../../services/invitations"

export const InvitationRpcLive = InvitationRpcs.toLayer(
	Effect.gen(function* () {
		const invitations = yield* Invitations
		return {
			"invitation.create": invitations.create,
			"invitation.list": invitations.list,
			"invitation.revoke": invitations.revoke,
			"invitation.preview": invitations.preview,
			"invitation.accept": invitations.accept,
		}
	}),
)
