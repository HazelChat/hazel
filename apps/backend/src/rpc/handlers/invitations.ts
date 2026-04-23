import { randomUUID } from "node:crypto"
import { InvitationRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, withRemapDbErrors } from "@hazel/domain"
import {
	InvitationBatchResponse,
	InvitationBatchResult,
	InvitationNotFoundError,
	InvitationResponse,
	InvitationRpcs,
} from "@hazel/domain/rpc"
import { Config, Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { InvitationPolicy } from "../../policies/invitation-policy"

/**
 * Invitation RPC handlers.
 *
 * NOTE: Since the WorkOS removal, invitations are local-only — we generate
 * an opaque token, stash it in the DB, and surface a copy-paste URL. No
 * email is sent; the admin shares the URL manually. A future pass can wire
 * this up to Clerk's organization-invitation API if we want email delivery.
 */
export const InvitationRpcLive = InvitationRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const invitationPolicy = yield* InvitationPolicy
		const invitationRepo = yield* InvitationRepo
		const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Config.withDefault(""))

		const makeInvitationToken = () => `inv_${randomUUID()}`
		const makeInvitationUrl = (token: string) =>
			frontendUrl ? `${frontendUrl}/invitations/${token}` : `/invitations/${token}`

		return {
			"invitation.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context

							const results = yield* Effect.forEach(
								payload.invites,
								(invite) =>
									Effect.gen(function* () {
										const token = makeInvitationToken()
										const expiresAt = new Date()
										expiresAt.setDate(expiresAt.getDate() + 7)

										yield* invitationPolicy.canCreate(payload.organizationId)
										const createdInvitation = yield* invitationRepo.upsertByWorkosId({
											workosInvitationId: token,
											organizationId: payload.organizationId,
											invitationUrl: makeInvitationUrl(token),
											email: invite.email,
											invitedBy: currentUser.id,
											invitedAt: new Date(),
											expiresAt,
											status: "pending",
											acceptedAt: null,
											acceptedBy: null,
										})

										const txid = yield* generateTransactionId()

										return new InvitationBatchResult({
											email: invite.email,
											success: true,
											data: createdInvitation,
											transactionId: txid,
										})
									}).pipe(
										Effect.catch((error) =>
											Effect.succeed(
												new InvitationBatchResult({
													email: invite.email,
													success: false,
													error:
														error && typeof error === "object" && "_tag" in error
															? `${error._tag}: ${String(error)}`
															: String(error),
												}),
											),
										),
									),
								{
									concurrency: 3,
								},
							)

							const successCount = results.filter((r) => r.success).length
							const errorCount = results.filter((r) => !r.success).length

							return new InvitationBatchResponse({ results, successCount, errorCount })
						}),
					)
					.pipe(withRemapDbErrors("Invitation", "create")),

			"invitation.resend": ({ invitationId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* invitationPolicy.canRead(invitationId)
							const invitationOption = yield* invitationRepo.findById(invitationId)
							if (Option.isNone(invitationOption)) {
								return yield* Effect.fail(new InvitationNotFoundError({ invitationId }))
							}

							const invitation = invitationOption.value

							const txid = yield* generateTransactionId()

							return { invitation, txid }
						}),
					)
					.pipe(
						withRemapDbErrors("Invitation", "update"),
						Effect.map(
							({ invitation, txid }) =>
								new InvitationResponse({
									data: invitation,
									transactionId: txid,
								}),
						),
					),

			"invitation.revoke": ({ invitationId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* invitationPolicy.canRead(invitationId)
							const invitationOption = yield* invitationRepo.findById(invitationId)

							if (Option.isNone(invitationOption)) {
								return yield* Effect.fail(new InvitationNotFoundError({ invitationId }))
							}

							yield* invitationPolicy.canUpdate(invitationId)
							yield* invitationRepo.updateStatus(invitationId, "revoked")

							const txid = yield* generateTransactionId()

							return { txid }
						}),
					)
					.pipe(
						withRemapDbErrors("Invitation", "delete"),
						Effect.map(({ txid }) => ({ transactionId: txid })),
					),

			"invitation.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* invitationPolicy.canUpdate(id)
							const updatedInvitation = yield* invitationRepo.update({
								id,
								...payload,
							})

							const txid = yield* generateTransactionId()

							return { updatedInvitation, txid }
						}),
					)
					.pipe(
						withRemapDbErrors("Invitation", "update"),
						Effect.map(
							({ updatedInvitation, txid }) =>
								new InvitationResponse({
									data: updatedInvitation,
									transactionId: txid,
								}),
						),
					),

			"invitation.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* invitationPolicy.canDelete(id)
							yield* invitationRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { txid }
						}),
					)
					.pipe(
						withRemapDbErrors("Invitation", "delete"),
						Effect.map(({ txid }) => ({ transactionId: txid })),
					),
		}
	}),
)
