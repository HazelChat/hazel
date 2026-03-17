import { and, Database, eq, isNull, Repository, schema, type TxFn } from "@hazel/db"
import type { ChannelId } from "@hazel/schema"
import { ConnectConversation } from "@hazel/domain/models"
import { ServiceMap, Effect, Layer, Option } from "effect"

export class ConnectConversationRepo extends ServiceMap.Service<ConnectConversationRepo>()(
	"ConnectConversationRepo",
	{
		make: Effect.gen(function* () {
			const baseRepo = yield* Repository.makeRepository(
				schema.connectConversationsTable,
				{ insert: ConnectConversation.Insert, update: ConnectConversation.Update },
				{
					idColumn: "id",
					name: "ConnectConversation",
				},
			)
			const db = yield* Database.Database

			const findByHostChannel = (hostChannelId: ChannelId, tx?: TxFn) =>
				db
					.makeQuery((execute, channelId: ChannelId) =>
						execute((client) =>
							client
								.select()
								.from(schema.connectConversationsTable)
								.where(
									and(
										eq(schema.connectConversationsTable.hostChannelId, channelId),
										isNull(schema.connectConversationsTable.deletedAt),
									),
								)
								.limit(1),
						),
					)(hostChannelId, tx)
					.pipe(Effect.map((results) => Option.fromNullishOr(results[0])))

			return {
				...baseRepo,
				findByHostChannel,
			}
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make)
}
