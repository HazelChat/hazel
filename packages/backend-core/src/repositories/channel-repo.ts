import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"

import type { OrganizationId } from "@hazel/schema"
import { Channel } from "@hazel/domain/models"
import { ServiceMap, Effect, Option } from "effect"

export class ChannelRepo extends ServiceMap.Service<ChannelRepo>()("ChannelRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.channelsTable, Channel.Model, {
			idColumn: "id",
			name: "Channel",
		})
		const db = yield* Database.Database

		const findByOrgAndName = (organizationId: OrganizationId, name: string, tx?: TxFn) =>
			db
				.makeQuery((execute, data: { organizationId: OrganizationId; name: string }) =>
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
				)({ organizationId, name }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		return {
			...baseRepo,
			findByOrgAndName,
		}
	}),
}) {}
