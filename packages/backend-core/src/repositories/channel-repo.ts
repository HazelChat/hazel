import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type OrganizationId, policyRequire } from "@hazel/domain"
import { Channel } from "@hazel/domain/models"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ChannelRepo extends Effect.Service<ChannelRepo>()("ChannelRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.channelsTable, Channel.Model, {
			idColumn: "id",
			name: "Channel",
		})
		const db = yield* Database.Database

		const findByOrgAndName = (organizationId: OrganizationId, name: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { organizationId: OrganizationId; name: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.channelsTable)
								.where(
									and(
										eq(schema.channelsTable.organizationId, data.organizationId),
										eq(schema.channelsTable.name, data.name),
										isNull(schema.channelsTable.deletedAt),
									),
								)
								.limit(1),
						),
					policyRequire("Channel", "select"),
				)({ organizationId, name }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		return {
			...baseRepo,
			findByOrgAndName,
		}
	}),
}) {}
