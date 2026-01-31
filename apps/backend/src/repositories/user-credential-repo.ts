import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire, type UserCredentialId, type UserId } from "@hazel/domain"
import { UserCredential } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

/**
 * Insert data for user credentials.
 * Note: encryptedKey is intentionally NOT part of the Model (for security),
 * so we need a separate insert type that includes it.
 */
export type UserCredentialInsert = {
	userId: UserId
	provider: UserCredential.CredentialProvider
	encryptedKey: string
	keyHint: string | null
}

export class UserCredentialRepo extends Effect.Service<UserCredentialRepo>()("UserCredentialRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.userCredentialsTable,
			UserCredential.Model,
			{
				idColumn: "id",
				name: "UserCredential",
			},
		)
		const db = yield* Database.Database

		/**
		 * Find a credential by user ID and provider.
		 * Only returns non-deleted credentials.
		 */
		const findByUserAndProvider = (
			userId: UserId,
			provider: UserCredential.CredentialProvider,
			tx?: TxFn,
		) =>
			db
				.makeQuery(
					(execute, data: { userId: UserId; provider: UserCredential.CredentialProvider }) =>
						execute((client) =>
							client
								.select()
								.from(schema.userCredentialsTable)
								.where(
									and(
										eq(schema.userCredentialsTable.userId, data.userId),
										eq(schema.userCredentialsTable.provider, data.provider),
										isNull(schema.userCredentialsTable.deletedAt),
									),
								),
						),
					policyRequire("UserCredential", "select"),
				)({ userId, provider }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Find all credentials for a user.
		 * Only returns non-deleted credentials.
		 */
		const findAllByUser = (userId: UserId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { userId: UserId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.userCredentialsTable)
							.where(
								and(
									eq(schema.userCredentialsTable.userId, data.userId),
									isNull(schema.userCredentialsTable.deletedAt),
								),
							)
							.orderBy(schema.userCredentialsTable.createdAt),
					),
				policyRequire("UserCredential", "select"),
			)({ userId }, tx)

		/**
		 * Find a credential by ID.
		 * Only returns if not deleted.
		 */
		const findById = (id: UserCredentialId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: UserCredentialId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.userCredentialsTable)
								.where(
									and(
										eq(schema.userCredentialsTable.id, data.id),
										isNull(schema.userCredentialsTable.deletedAt),
									),
								),
						),
					policyRequire("UserCredential", "select"),
				)({ id }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Soft delete a credential by ID.
		 */
		const softDelete = (id: UserCredentialId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { id: UserCredentialId }) =>
					execute((client) =>
						client
							.update(schema.userCredentialsTable)
							.set({ deletedAt: new Date(), updatedAt: new Date() })
							.where(eq(schema.userCredentialsTable.id, data.id))
							.returning(),
					),
				policyRequire("UserCredential", "delete"),
			)({ id }, tx)

		/**
		 * Insert a new credential.
		 * This is a custom insert that includes encryptedKey (not in Model for security).
		 */
		const insert = (data: UserCredentialInsert, tx?: TxFn) =>
			db.makeQuery(
				(execute, insertData: UserCredentialInsert) =>
					execute((client) =>
						client
							.insert(schema.userCredentialsTable)
							.values({
								userId: insertData.userId,
								provider: insertData.provider,
								encryptedKey: insertData.encryptedKey,
								keyHint: insertData.keyHint,
							})
							.returning(),
					),
				policyRequire("UserCredential", "create"),
			)(data, tx)

		return {
			...baseRepo,
			insert,
			findByUserAndProvider,
			findAllByUser,
			findById,
			softDelete,
		} as const
	}),
	dependencies: [DatabaseLive],
}) {}
