import { AttachmentRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { withRemapDbErrors } from "@hazel/domain"
import { AttachmentRpcs } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AttachmentPolicy } from "../../policies/attachment-policy"

export const AttachmentRpcLive = AttachmentRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"attachment.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* AttachmentPolicy.canDelete(id)
							yield* AttachmentRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("Attachment", "delete")),

			"attachment.complete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* AttachmentPolicy.canUpdate(id)
							const attachment = yield* AttachmentRepo.update({ id, status: "complete" })

							return attachment
						}),
					)
					.pipe(withRemapDbErrors("Attachment", "update")),

			"attachment.fail": ({ id, reason }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* Effect.logWarning(
								`Marking attachment ${id} as failed${reason ? `: ${reason}` : ""}`,
							)

							yield* AttachmentPolicy.canUpdate(id)
							yield* AttachmentRepo.update({ id, status: "failed" })
						}),
					)
					.pipe(withRemapDbErrors("Attachment", "update")),
		}
	}),
)
