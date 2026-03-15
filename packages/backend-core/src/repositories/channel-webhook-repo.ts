import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"

import type { ChannelId, ChannelWebhookId, OrganizationId } from "@hazel/schema"
import { ChannelWebhook } from "@hazel/domain/models"
import { ServiceMap, Effect, Option } from "effect"

export class ChannelWebhookRepo extends ServiceMap.Service<ChannelWebhookRepo>()("ChannelWebhookRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.channelWebhooksTable,
			ChannelWebhook.Model,
			{
				idColumn: "id",
				name: "ChannelWebhook",
			},
		)
		const db = yield* Database.Database

		// Find all webhooks for a channel
		const findByChannel = (channelId: ChannelId, tx?: TxFn) =>
			db.makeQuery((execute, data: { channelId: ChannelId }) =>
				execute((client) =>
					client
						.select()
						.from(schema.channelWebhooksTable)
						.where(
							and(
								eq(schema.channelWebhooksTable.channelId, data.channelId),
								isNull(schema.channelWebhooksTable.deletedAt),
							),
						),
				),
			)({ channelId }, tx)

		// Find webhook by token hash (for authentication)
		const findByTokenHash = (tokenHash: string, tx?: TxFn) =>
			db
				.makeQuery((execute, data: { tokenHash: string }) =>
					execute((client) =>
						client
							.select()
							.from(schema.channelWebhooksTable)
							.where(
								and(
									eq(schema.channelWebhooksTable.tokenHash, data.tokenHash),
									isNull(schema.channelWebhooksTable.deletedAt),
								),
							)
							.limit(1),
					),
				)({ tokenHash }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Update last used timestamp
		const updateLastUsed = (id: ChannelWebhookId, tx?: TxFn) =>
			db.makeQuery((execute, data: { id: ChannelWebhookId }) =>
				execute((client) =>
					client
						.update(schema.channelWebhooksTable)
						.set({ lastUsedAt: new Date(), updatedAt: new Date() })
						.where(eq(schema.channelWebhooksTable.id, data.id))
						.returning(),
				),
			)({ id }, tx)

		// Update token hash (for token regeneration)
		const updateToken = (id: ChannelWebhookId, tokenHash: string, tokenSuffix: string, tx?: TxFn) =>
			db.makeQuery((execute, data: { id: ChannelWebhookId; tokenHash: string; tokenSuffix: string }) =>
				execute((client) =>
					client
						.update(schema.channelWebhooksTable)
						.set({
							tokenHash: data.tokenHash,
							tokenSuffix: data.tokenSuffix,
							updatedAt: new Date(),
						})
						.where(eq(schema.channelWebhooksTable.id, data.id))
						.returning(),
				),
			)({ id, tokenHash, tokenSuffix }, tx)

		// Soft delete webhook
		const softDelete = (id: ChannelWebhookId, tx?: TxFn) =>
			db.makeQuery((execute, data: { id: ChannelWebhookId }) =>
				execute((client) =>
					client
						.update(schema.channelWebhooksTable)
						.set({
							deletedAt: new Date(),
							updatedAt: new Date(),
						})
						.where(eq(schema.channelWebhooksTable.id, data.id))
						.returning(),
				),
			)({ id }, tx)

		// Find all webhooks for an organization
		const findByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery((execute, data: { organizationId: OrganizationId }) =>
				execute((client) =>
					client
						.select()
						.from(schema.channelWebhooksTable)
						.where(
							and(
								eq(schema.channelWebhooksTable.organizationId, data.organizationId),
								isNull(schema.channelWebhooksTable.deletedAt),
							),
						),
				),
			)({ organizationId }, tx)

		return {
			...baseRepo,
			findByChannel,
			findByTokenHash,
			updateLastUsed,
			updateToken,
			softDelete,
			findByOrganization,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
