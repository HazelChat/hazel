import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire, type UserId } from "@hazel/domain"
import { User } from "@hazel/domain/models"
import { Effect, Option, type Schema } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class UserRepo extends Effect.Service<UserRepo>()("UserRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.usersTable, User.Model, {
			idColumn: "id",
			name: "User",
		})
		const db = yield* Database.Database

		const findByExternalId = (externalId: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, id: string) =>
						execute((client) =>
							client
								.select()
								.from(schema.usersTable)
								.where(eq(schema.usersTable.externalId, id))
								.limit(1),
						),
					policyRequire("User", "select"),
				)(externalId, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Upsert user by external ID.
		 * @param data - User data to upsert
		 * @param options - Optional settings
		 * @param options.syncAvatarUrl - If true, sync avatarUrl from external source (WorkOS).
		 *                                 If false (default), preserve local avatarUrl (managed via R2 uploads).
		 * @param tx - Optional transaction
		 */
		const upsertByExternalId = (
			data: Schema.Schema.Type<typeof User.Insert>,
			options?: { syncAvatarUrl?: boolean },
			tx?: TxFn,
		) =>
			db
				.makeQuery(
					(execute, input: typeof data & { syncAvatarUrl?: boolean }) =>
						execute((client) =>
							client
								.insert(schema.usersTable)
								.values(input)
								.onConflictDoUpdate({
									target: schema.usersTable.externalId,
									set: {
										firstName: input.firstName,
										lastName: input.lastName,
										// Only sync avatarUrl when explicitly requested (e.g., WorkOS sync)
										// Otherwise preserve local avatarUrl managed via R2 uploads
										...(input.syncAvatarUrl && { avatarUrl: input.avatarUrl }),
										email: input.email,
										updatedAt: new Date(),
									},
								})
								.returning(),
						),
					policyRequire("User", "create"),
				)({ ...data, syncAvatarUrl: options?.syncAvatarUrl }, tx)
				.pipe(Effect.map((results) => results[0]))

		const findAllActive = (tx?: TxFn) =>
			db.makeQuery(
				(execute, _data: {}) =>
					execute((client) =>
						client.select().from(schema.usersTable).where(isNull(schema.usersTable.deletedAt)),
					),
				policyRequire("User", "select"),
			)({}, tx)

		const softDelete = (id: UserId, tx?: TxFn) =>
			db.makeQuery(
				(execute, userId: UserId) =>
					execute((client) =>
						client
							.update(schema.usersTable)
							.set({ deletedAt: new Date() })
							.where(
								and(eq(schema.usersTable.id, userId), isNull(schema.usersTable.deletedAt)),
							),
					),
				policyRequire("User", "delete"),
			)(id, tx)

		const softDeleteByExternalId = (externalId: string, tx?: TxFn) =>
			db.makeQuery(
				(execute, id: string) =>
					execute((client) =>
						client
							.update(schema.usersTable)
							.set({ deletedAt: new Date() })
							.where(
								and(
									eq(schema.usersTable.externalId, id),
									isNull(schema.usersTable.deletedAt),
								),
							),
					),
				policyRequire("User", "delete"),
			)(externalId, tx)

		const bulkUpsertByExternalId = (users: Schema.Schema.Type<typeof User.Insert>[]) =>
			Effect.forEach(users, (data) => upsertByExternalId(data), { concurrency: 10 })

		return {
			...baseRepo,
			findByExternalId,
			upsertByExternalId,
			findAllActive,
			softDelete,
			softDeleteByExternalId,
			bulkUpsertByExternalId,
		}
	}),
}) {}
