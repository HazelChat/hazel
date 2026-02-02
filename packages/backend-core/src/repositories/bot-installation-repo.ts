import { and, Database, eq, inArray, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type BotId, type BotInstallationId, type OrganizationId, policyRequire } from "@hazel/domain"
import { BotInstallation } from "@hazel/domain/models"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class BotInstallationRepo extends Effect.Service<BotInstallationRepo>()("BotInstallationRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.botInstallationsTable,
			BotInstallation.Model,
			{
				idColumn: "id",
				name: "BotInstallation",
			},
		)
		const db = yield* Database.Database

		// Find all installations for an organization
		const findByOrg = (organizationId: OrganizationId, tx?: TxFn) =>
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

		// Find all installations for a bot
		const findByBot = (botId: BotId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { botId: BotId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botInstallationsTable)
							.where(eq(schema.botInstallationsTable.botId, data.botId)),
					),
				policyRequire("BotInstallation", "select"),
			)({ botId }, tx)

		// Find a specific installation
		const findByBotAndOrg = (botId: BotId, organizationId: OrganizationId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { botId: BotId; organizationId: OrganizationId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.botInstallationsTable)
								.where(
									and(
										eq(schema.botInstallationsTable.botId, data.botId),
										eq(schema.botInstallationsTable.organizationId, data.organizationId),
									),
								)
								.limit(1),
						),
					policyRequire("BotInstallation", "select"),
				)({ botId, organizationId }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Check if a bot is installed in an organization
		const isInstalled = (botId: BotId, organizationId: OrganizationId, tx?: TxFn) =>
			findByBotAndOrg(botId, organizationId, tx).pipe(Effect.map(Option.isSome))

		// Get bot IDs installed in an organization
		const getBotIdsForOrg = (organizationId: OrganizationId, tx?: TxFn) =>
			findByOrg(organizationId, tx).pipe(
				Effect.map((installations) => installations.map((i) => i.botId)),
			)

		return {
			...baseRepo,
			findByOrg,
			findByBot,
			findByBotAndOrg,
			isInstalled,
			getBotIdsForOrg,
		}
	}),
}) {}
