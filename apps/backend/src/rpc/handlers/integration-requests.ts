import { Database, schema } from "@hazel/db"
import { CurrentUser, withRemapDbErrors } from "@hazel/domain"
import { IntegrationRequestRpcs } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { transactionAwareExecute } from "../../lib/transaction-aware-execute"

/**
 * Integration Request RPC Handlers
 *
 * Simple handler for creating integration requests.
 * Uses direct database access (no repository/policies needed for this one-off feature).
 */
export const IntegrationRequestRpcLive = IntegrationRequestRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"integrationRequest.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context

							// Direct database insert
							const [result] = yield* transactionAwareExecute((client) =>
								client
									.insert(schema.integrationRequestsTable)
									.values({
										organizationId: payload.organizationId,
										requestedBy: currentUser.id,
										integrationName: payload.integrationName,
										integrationUrl: payload.integrationUrl ?? null,
										description: payload.description ?? null,
										status: "pending",
									})
									.returning(),
							)

							const txid = yield* generateTransactionId()

							return {
								data: result,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("IntegrationRequest", "create")),
		}
	}),
)
