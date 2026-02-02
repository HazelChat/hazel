import { OrganizationMemberRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, InternalServerError, policyUse, withRemapDbErrors } from "@hazel/domain"
import { OrganizationMemberNotFoundError, OrganizationMemberRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { OrganizationMemberPolicy } from "../../policies/organization-member-policy"

/**
 * Organization Member RPC Handlers
 *
 * Implements the business logic for all organization member-related RPC methods.
 * Each handler receives the payload and has access to CurrentUser via Effect context
 * (provided by AuthMiddleware).
 *
 * All handlers use:
 * - Database transactions for atomicity
 * - Policy checks for authorization
 * - Transaction IDs for optimistic updates
 * - Error remapping for consistent error handling
 */
export const OrganizationMemberRpcLive = OrganizationMemberRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"organizationMember.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							const createdOrganizationMember = yield* OrganizationMemberRepo.insert({
								...payload,
								userId: user.id,
								deletedAt: null,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(OrganizationMemberPolicy.canCreate(payload.organizationId)),
							)

							const txid = yield* generateTransactionId()

							return {
								data: createdOrganizationMember,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("OrganizationMember", "create")),

			"organizationMember.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedOrganizationMember = yield* OrganizationMemberRepo.update({
								id,
								...payload,
							}).pipe(policyUse(OrganizationMemberPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedOrganizationMember,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("OrganizationMember", "update")),

			"organizationMember.updateMetadata": ({ id, metadata }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedOrganizationMemberOption =
								yield* OrganizationMemberRepo.updateMetadata(id, metadata).pipe(
									policyUse(OrganizationMemberPolicy.canUpdate(id)),
								)

							const updatedOrganizationMember = yield* Option.match(
								updatedOrganizationMemberOption,
								{
									onNone: () =>
										Effect.fail(
											new OrganizationMemberNotFoundError({
												organizationMemberId: id,
											}),
										),
									onSome: (member) => Effect.succeed(member),
								},
							)

							const txid = yield* generateTransactionId()

							return {
								data: updatedOrganizationMember,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("OrganizationMember", "update")),

			"organizationMember.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* OrganizationMemberRepo.deleteById(id).pipe(
								policyUse(OrganizationMemberPolicy.canDelete(id)),
							)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new InternalServerError({
										message: "Error Deleting Organization Member",
										cause: err,
									}),
								),
						}),
					),
		}
	}),
)
