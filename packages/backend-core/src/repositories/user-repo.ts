import { Database, PG, Repository, schema } from "@hazel/db"

import type { ClerkUserId, UserId } from "@hazel/schema"
import { User } from "@hazel/domain/models"
import { Context, DateTime, Effect, Layer, type Schema } from "effect"

/** Timestamp columns take a `Date`; domain models carry `Date | DateTime.Utc`. */
const toNullableDate = (value: Date | DateTime.Utc | null): Date | null =>
	value === null ? null : DateTime.isDateTime(value) ? DateTime.toDate(value) : value

export class UserRepo extends Context.Service<UserRepo>()("UserRepo", {
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

		const findByExternalId = (externalId: string) =>
			db.first(
				PG.from(schema.usersTable)
					.select()
					.where(($) => [$.externalId.eq(externalId)])
					.limit(1),
			)

		/**
		 * Upsert user by external ID.
		 * @param options.syncAvatarUrl - If true, sync avatarUrl from the identity
		 *   provider; if false (default), preserve local avatarUrl (managed via R2 uploads).
		 */
		const upsertByExternalId = (
			data: Schema.Schema.Type<typeof User.Insert>,
			options?: { syncAvatarUrl?: boolean },
		) =>
			db
				.run(
					PG.insertInto(schema.usersTable)
						.values({
							externalId: data.externalId,
							email: data.email,
							firstName: data.firstName,
							lastName: data.lastName,
							avatarUrl: data.avatarUrl,
							userType: data.userType,
							settings: data.settings,
							isOnboarded: data.isOnboarded,
							timezone: data.timezone,
							deletedAt: toNullableDate(data.deletedAt),
						})
						.onConflictDoUpdate({
							target: ["externalId"],
							set: {
								firstName: data.firstName,
								lastName: data.lastName,
								...(options?.syncAvatarUrl && { avatarUrl: data.avatarUrl }),
								email: data.email,
								updatedAt: new Date(),
							},
						})
						.returning(),
				)
				.pipe(Effect.map((results) => results[0]))

		const upsertClerkUser = (
			data: Omit<Schema.Schema.Type<typeof User.Insert>, "externalId"> & { externalId: ClerkUserId },
			options?: { syncAvatarUrl?: boolean },
		) => upsertByExternalId(data, options)

		const findAllActive = () =>
			db.run(
				PG.from(schema.usersTable)
					.select()
					.where(($) => [$.deletedAt.isNull()]),
			)

		const softDelete = (id: UserId) =>
			db.run(
				PG.update(schema.usersTable)
					.set({ deletedAt: new Date() })
					.where(($) => [$.id.eq(id), $.deletedAt.isNull()]),
			)

		const softDeleteByExternalId = (externalId: string) =>
			db.run(
				PG.update(schema.usersTable)
					.set({ deletedAt: new Date() })
					.where(($) => [$.externalId.eq(externalId), $.deletedAt.isNull()]),
			)

		const softDeleteByClerkUserId = (clerkUserId: ClerkUserId) => softDeleteByExternalId(clerkUserId)

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
