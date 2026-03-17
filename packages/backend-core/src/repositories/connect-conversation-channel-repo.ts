import { and, Database, eq, isNull, Repository, schema, type TxFn } from "@hazel/db"
import type { ChannelId, ConnectConversationId, OrganizationId } from "@hazel/schema"
import { ConnectConversationChannel } from "@hazel/domain/models"
import { ServiceMap, Effect, Layer, Option } from "effect"

export class ConnectConversationChannelRepo extends ServiceMap.Service<ConnectConversationChannelRepo>()(
	"ConnectConversationChannelRepo",
	{
		make: Effect.gen(function* () {
			const baseRepo = yield* Repository.makeRepository(
				schema.connectConversationChannelsTable,
				{ insert: ConnectConversationChannel.Insert, update: ConnectConversationChannel.Update },
				{
					idColumn: "id",
					name: "ConnectConversationChannel",
				},
			)
			const db = yield* Database.Database

			const findByChannelId = (channelId: ChannelId, tx?: TxFn) =>
				db
					.makeQuery((execute, input: ChannelId) =>
						execute((client) =>
							client
								.select()
								.from(schema.connectConversationChannelsTable)
								.where(
									and(
										eq(schema.connectConversationChannelsTable.channelId, input),
										isNull(schema.connectConversationChannelsTable.deletedAt),
									),
								)
								.limit(1),
						),
					)(channelId, tx)
					.pipe(Effect.map((results) => Option.fromNullishOr(results[0])))

			const findByConversationId = (conversationId: ConnectConversationId, tx?: TxFn) =>
				db.makeQuery((execute, input: ConnectConversationId) =>
					execute((client) =>
						client
							.select()
							.from(schema.connectConversationChannelsTable)
							.where(
								and(
									eq(schema.connectConversationChannelsTable.conversationId, input),
									isNull(schema.connectConversationChannelsTable.deletedAt),
								),
							),
					),
				)(conversationId, tx)

			const findByConversationAndOrganization = (
				conversationId: ConnectConversationId,
				organizationId: OrganizationId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							input: { conversationId: ConnectConversationId; organizationId: OrganizationId },
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.connectConversationChannelsTable)
									.where(
										and(
											eq(
												schema.connectConversationChannelsTable.conversationId,
												input.conversationId,
											),
											eq(
												schema.connectConversationChannelsTable.organizationId,
												input.organizationId,
											),
											isNull(schema.connectConversationChannelsTable.deletedAt),
										),
									)
									.limit(1),
							),
					)({ conversationId, organizationId }, tx)
					.pipe(Effect.map((results) => Option.fromNullishOr(results[0])))

			return {
				...baseRepo,
				findByChannelId,
				findByConversationId,
				findByConversationAndOrganization,
			}
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make)
}
