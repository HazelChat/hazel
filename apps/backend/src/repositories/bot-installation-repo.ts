/**
 * Bot Installation Repository
 *
 * Manages bot installation records for the built-in bot SDK.
 */

import { and, Database, eq, schema, type TransactionClient } from "@hazel/db"
import { type OrganizationId, policyRequire, type UserId } from "@hazel/domain"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database.ts"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class BotInstallationRepo extends Effect.Service<BotInstallationRepo>()("BotInstallationRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		// Find a specific bot installation for an org
		const findByOrgAndBot = (organizationId: OrganizationId, botId: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { organizationId: OrganizationId; botId: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.botInstallationsTable)
								.where(
									and(
										eq(schema.botInstallationsTable.organizationId, data.organizationId),
										eq(schema.botInstallationsTable.botId, data.botId),
									),
								)
								.limit(1),
						),
					policyRequire("BotInstallation", "select"),
				)({ organizationId, botId }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Find all bot installations for an org
		const findAllForOrg = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { organizationId: OrganizationId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botInstallationsTable)
							.where(eq(schema.botInstallationsTable.organizationId, data.organizationId)),
					),
				policyRequire("BotInstallation", "select"),
			)({ organizationId }, tx)

		// Insert a new bot installation
		const insert = (
			data: {
				organizationId: OrganizationId
				botId: string
				installedBy: UserId | null
				config?: Record<string, unknown>
			},
			tx?: TxFn,
		) =>
			db
				.makeQuery(
					(
						execute,
						insertData: {
							organizationId: OrganizationId
							botId: string
							installedBy: UserId | null
							config?: Record<string, unknown>
						},
					) =>
						execute((client) =>
							client
								.insert(schema.botInstallationsTable)
								.values({
									organizationId: insertData.organizationId,
									botId: insertData.botId,
									installedBy: insertData.installedBy ?? undefined,
									config: insertData.config ?? {},
								})
								.returning(),
						),
					policyRequire("BotInstallation", "insert"),
				)(data, tx)
				.pipe(Effect.map((results) => results[0]!))

		// Delete a bot installation
		const deleteByOrgAndBot = (organizationId: OrganizationId, botId: string, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { organizationId: OrganizationId; botId: string }) =>
					execute((client) =>
						client
							.delete(schema.botInstallationsTable)
							.where(
								and(
									eq(schema.botInstallationsTable.organizationId, data.organizationId),
									eq(schema.botInstallationsTable.botId, data.botId),
								),
							)
							.returning(),
					),
				policyRequire("BotInstallation", "delete"),
			)({ organizationId, botId }, tx)

		return {
			findByOrgAndBot,
			findAllForOrg,
			insert,
			deleteByOrgAndBot,
		}
	}),
	dependencies: [DatabaseLive],
}) {}
