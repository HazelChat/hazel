import {
	and,
	Database,
	eq,
	isNull,
	lte,
	ModelRepository,
	or,
	schema,
	type TransactionClient,
} from "@hazel/db"
import { policyRequire, type SandboxId, type UserId } from "@hazel/domain"
import { Sandbox } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class SandboxRepo extends Effect.Service<SandboxRepo>()("SandboxRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.sandboxesTable, Sandbox.Model, {
			idColumn: "id",
			name: "Sandbox",
		})
		const db = yield* Database.Database

		/**
		 * Find a sandbox by ID.
		 * Only returns if not deleted.
		 */
		const findById = (id: SandboxId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: SandboxId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.sandboxesTable)
								.where(
									and(
										eq(schema.sandboxesTable.id, data.id),
										isNull(schema.sandboxesTable.deletedAt),
									),
								),
						),
					policyRequire("Sandbox", "select"),
				)({ id }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Find all sandboxes for a user.
		 * Optionally filter by status.
		 */
		const findAllByUser = (userId: UserId, status?: Sandbox.SandboxStatus, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { userId: UserId; status?: Sandbox.SandboxStatus }) =>
					execute((client) => {
						const conditions = [
							eq(schema.sandboxesTable.userId, data.userId),
							isNull(schema.sandboxesTable.deletedAt),
						]
						if (data.status) {
							conditions.push(eq(schema.sandboxesTable.status, data.status))
						}
						return client
							.select()
							.from(schema.sandboxesTable)
							.where(and(...conditions))
							.orderBy(schema.sandboxesTable.createdAt)
					}),
				policyRequire("Sandbox", "select"),
			)({ userId, status }, tx)

		/**
		 * Find all active sandboxes for a user (running or provisioning).
		 */
		const findActiveByUser = (userId: UserId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { userId: UserId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.sandboxesTable)
							.where(
								and(
									eq(schema.sandboxesTable.userId, data.userId),
									or(
										eq(schema.sandboxesTable.status, "running"),
										eq(schema.sandboxesTable.status, "provisioning"),
									),
									isNull(schema.sandboxesTable.deletedAt),
								),
							)
							.orderBy(schema.sandboxesTable.createdAt),
					),
				policyRequire("Sandbox", "select"),
			)({ userId }, tx)

		/**
		 * Find sandboxes that have expired.
		 * Used by cleanup cron job.
		 */
		const findExpired = (tx?: TxFn) =>
			db.makeQuery(
				(execute, _data: object) =>
					execute((client) =>
						client
							.select()
							.from(schema.sandboxesTable)
							.where(
								and(
									lte(schema.sandboxesTable.expiresAt, new Date()),
									or(
										eq(schema.sandboxesTable.status, "running"),
										eq(schema.sandboxesTable.status, "provisioning"),
									),
									isNull(schema.sandboxesTable.deletedAt),
								),
							),
					),
				policyRequire("Sandbox", "select"),
			)({}, tx)

		/**
		 * Update sandbox status.
		 */
		const updateStatus = (
			id: SandboxId,
			status: Sandbox.SandboxStatus,
			errorMessage?: string,
			tx?: TxFn,
		) =>
			db
				.makeQuery(
					(
						execute,
						data: { id: SandboxId; status: Sandbox.SandboxStatus; errorMessage?: string },
					) =>
						execute((client) =>
							client
								.update(schema.sandboxesTable)
								.set({
									status: data.status,
									errorMessage: data.errorMessage ?? null,
									updatedAt: new Date(),
								})
								.where(eq(schema.sandboxesTable.id, data.id))
								.returning(),
						),
					policyRequire("Sandbox", "update"),
				)({ id, status, errorMessage }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Set sandbox public URL (after provisioning completes).
		 */
		const setPublicUrl = (id: SandboxId, publicUrl: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: SandboxId; publicUrl: string }) =>
						execute((client) =>
							client
								.update(schema.sandboxesTable)
								.set({
									publicUrl: data.publicUrl,
									status: "running",
									updatedAt: new Date(),
								})
								.where(eq(schema.sandboxesTable.id, data.id))
								.returning(),
						),
					policyRequire("Sandbox", "update"),
				)({ id, publicUrl }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Soft delete a sandbox.
		 */
		const softDelete = (id: SandboxId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { id: SandboxId }) =>
					execute((client) =>
						client
							.update(schema.sandboxesTable)
							.set({
								status: "stopped",
								deletedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(eq(schema.sandboxesTable.id, data.id))
							.returning(),
					),
				policyRequire("Sandbox", "delete"),
			)({ id }, tx)

		return {
			...baseRepo,
			findById,
			findAllByUser,
			findActiveByUser,
			findExpired,
			updateStatus,
			setPublicUrl,
			softDelete,
		} as const
	}),
	dependencies: [DatabaseLive],
}) {}
