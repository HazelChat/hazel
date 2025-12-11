import { Database } from "@hazel/db"
import { policyUse, withRemapDbErrors } from "@hazel/domain"
import { AttachmentRpcs } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AttachmentPolicy } from "../../policies/attachment-policy"
import { AttachmentRepo } from "../../repositories/attachment-repo"

export const AttachmentRpcLive = AttachmentRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"attachment.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* AttachmentRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(
						policyUse(AttachmentPolicy.canDelete(id)),
						withRemapDbErrors("Attachment", "delete"),
					),

			"attachment.complete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const attachment = yield* AttachmentRepo.update({ id, status: "complete" }).pipe(
								policyUse(AttachmentPolicy.canUpdate(id)),
							)

							return attachment
						}),
					)
					.pipe(withRemapDbErrors("Attachment", "update")),
		}
	}),
)
