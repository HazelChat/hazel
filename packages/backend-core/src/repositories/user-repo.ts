import { and, Database, eq, isNull, Repository, schema, type TxFn } from "@hazel/db"

import type { ClerkUserId, UserId } from "@hazel/schema"
import { User } from "@hazel/domain/models"
import { ServiceMap, Effect, Layer, Option, type Schema } from "effect"

export class UserRepo extends ServiceMap.Service<UserRepo>()("UserRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* Repository.makeRepository(
			schema.usersTable,
			{ insert: User.Insert, update: User.Update },
			{
				idColumn: "id",
				name: "User",
			},
		)
		const db = yield* Database.Database

		const findByExternalId = (externalId: string, tx?: TxFn) =>
			db
				.makeQuery((execute, id: string) =>
					execute((client) =>
						client
							.select()
							.from(schema.usersTable)
							.where(eq(schema.usersTable.externalId, id))
							.limit(1),
					),
				)(externalId, tx)
				.pipe(Effect.map((results) => Option.fromNullishOr(results[0])))

		/**
		 * Upsert user by external ID.
		 * @param options.syncAvatarUrl - If true, sync avatarUrl from the identity
		 *   provider; if false (default), preserve local avatarUrl (managed via R2 uploads).
		 */
		const upsertByExternalId = (
			data: Schema.Schema.Type<typeof User.Insert>,
			options?: { syncAvatarUrl?: boolean },
			tx?: TxFn,
		) =>
			db
				.makeQuery((execute, input: typeof data & { syncAvatarUrl?: boolean }) =>
					execute((client) =>
						client
							.insert(schema.usersTable)
							.values(input as any)
							.onConflictDoUpdate({
								target: schema.usersTable.externalId,
								set: {
									firstName: input.firstName,
									lastName: input.lastName,
									...(input.syncAvatarUrl && { avatarUrl: input.avatarUrl }),
									email: input.email,
									updatedAt: new Date(),
								},
							})
							.returning(),
					),
				)({ ...data, syncAvatarUrl: options?.syncAvatarUrl }, tx)
				.pipe(Effect.map((results) => results[0]))

		const upsertClerkUser = (
			data: Omit<Schema.Schema.Type<typeof User.Insert>, "externalId"> & { externalId: ClerkUserId },
			options?: { syncAvatarUrl?: boolean },
			tx?: TxFn,
		) => upsertByExternalId(data, options, tx)

		const findAllActive = (tx?: TxFn) =>
			db.makeQuery((execute, _data: {}) =>
				execute((client) =>
					client.select().from(schema.usersTable).where(isNull(schema.usersTable.deletedAt)),
				),
			)({}, tx)

		const softDelete = (id: UserId, tx?: TxFn) =>
			db.makeQuery((execute, userId: UserId) =>
				execute((client) =>
					client
						.update(schema.usersTable)
						.set({ deletedAt: new Date() })
						.where(and(eq(schema.usersTable.id, userId), isNull(schema.usersTable.deletedAt))),
				),
			)(id, tx)

		const softDeleteByExternalId = (externalId: string, tx?: TxFn) =>
			db.makeQuery((execute, id: string) =>
				execute((client) =>
					client
						.update(schema.usersTable)
						.set({ deletedAt: new Date() })
						.where(
							and(eq(schema.usersTable.externalId, id), isNull(schema.usersTable.deletedAt)),
						),
				),
			)(externalId, tx)

		const softDeleteByClerkUserId = (clerkUserId: ClerkUserId, tx?: TxFn) =>
			softDeleteByExternalId(clerkUserId, tx)

		const bulkUpsertByExternalId = (users: Schema.Schema.Type<typeof User.Insert>[]) =>
			Effect.forEach(users, (data) => upsertByExternalId(data), { concurrency: 10 })

		return {
			...baseRepo,
			findByExternalId,
			upsertByExternalId,
			upsertClerkUser,
			findAllActive,
			softDelete,
			softDeleteByExternalId,
			softDeleteByClerkUserId,
			bulkUpsertByExternalId,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
