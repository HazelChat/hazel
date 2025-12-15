import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type OrganizationId, policyRequire } from "@hazel/domain"
import { ChannelCategory } from "@hazel/domain/models"
import { Effect } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ChannelCategoryRepo extends Effect.Service<ChannelCategoryRepo>()("ChannelCategoryRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.channelCategoriesTable, ChannelCategory.Model, {
			idColumn: "id",
			name: "ChannelCategory",
		})
		const db = yield* Database.Database

		const findByOrganizationId = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery(
				(execute, id: OrganizationId) =>
					execute((client) =>
						client
							.select()
							.from(schema.channelCategoriesTable)
							.where(
								and(
									eq(schema.channelCategoriesTable.organizationId, id),
									isNull(schema.channelCategoriesTable.deletedAt),
								),
							)
							.orderBy(schema.channelCategoriesTable.sortOrder),
					),
				policyRequire("ChannelCategory", "select"),
			)(organizationId, tx)

		return {
			...baseRepo,
			findByOrganizationId,
		}
	}),
	dependencies: [DatabaseLive],
}) {}
