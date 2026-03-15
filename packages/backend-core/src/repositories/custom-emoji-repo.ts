import { and, Database, eq, isNotNull, isNull, ModelRepository, schema } from "@hazel/db"

import type { CustomEmojiId, OrganizationId } from "@hazel/schema"
import { CustomEmoji } from "@hazel/domain/models"
import { ServiceMap, Effect, Option } from "effect"

export class CustomEmojiRepo extends ServiceMap.Service<CustomEmojiRepo>()("CustomEmojiRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.customEmojisTable, CustomEmoji.Model, {
			idColumn: "id",
			name: "CustomEmoji",
		})
		const db = yield* Database.Database

		const findByOrgAndName = (organizationId: OrganizationId, name: string) =>
			db
				.makeQuery((execute, data: { organizationId: OrganizationId; name: string }) =>
					execute((client) =>
						client
							.select()
							.from(schema.customEmojisTable)
							.where(
								and(
									eq(schema.customEmojisTable.organizationId, data.organizationId),
									eq(schema.customEmojisTable.name, data.name),
									isNull(schema.customEmojisTable.deletedAt),
								),
							)
							.limit(1),
					),
				)({ organizationId, name })
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const findDeletedByOrgAndName = (organizationId: OrganizationId, name: string) =>
			db
				.makeQuery((execute, data: { organizationId: OrganizationId; name: string }) =>
					execute((client) =>
						client
							.select()
							.from(schema.customEmojisTable)
							.where(
								and(
									eq(schema.customEmojisTable.organizationId, data.organizationId),
									eq(schema.customEmojisTable.name, data.name),
									isNotNull(schema.customEmojisTable.deletedAt),
								),
							)
							.limit(1),
					),
				)({ organizationId, name })
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const restore = (id: CustomEmojiId, imageUrl?: string) =>
			db
				.makeQuery((execute, data: { id: CustomEmojiId; imageUrl?: string }) =>
					execute((client) =>
						client
							.update(schema.customEmojisTable)
							.set({
								deletedAt: null,
								updatedAt: new Date(),
								...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
							})
							.where(
								and(
									eq(schema.customEmojisTable.id, data.id),
									isNotNull(schema.customEmojisTable.deletedAt),
								),
							)
							.returning(),
					),
				)({ id, imageUrl })
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const softDelete = (id: CustomEmojiId) =>
			db
				.makeQuery((execute, emojiId: CustomEmojiId) =>
					execute((client) =>
						client
							.update(schema.customEmojisTable)
							.set({ deletedAt: new Date() })
							.where(
								and(
									eq(schema.customEmojisTable.id, emojiId),
									isNull(schema.customEmojisTable.deletedAt),
								),
							)
							.returning(),
					),
				)(id)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		return {
			...baseRepo,
			findByOrgAndName,
			findDeletedByOrgAndName,
			softDelete,
			restore,
		}
	}),
}) {}
