import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"
import type { ChannelId } from "@hazel/schema"
import { ConnectConversation } from "@hazel/domain/models"
import { Effect, Option } from "effect"

export class ConnectConversationRepo extends Effect.Service<ConnectConversationRepo>()(
	"ConnectConversationRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.connectConversationsTable,
				ConnectConversation.Model,
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
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			return {
				...baseRepo,
				findByHostChannel,
			}
		}),
	},
) {}
