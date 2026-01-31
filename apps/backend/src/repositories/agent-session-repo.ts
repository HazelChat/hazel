import { and, Database, eq, isNull, ModelRepository, or, schema, type TransactionClient } from "@hazel/db"
import { policyRequire, type AgentSessionId, type SandboxId, type UserId } from "@hazel/domain"
import { AgentSession } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class AgentSessionRepo extends Effect.Service<AgentSessionRepo>()("AgentSessionRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.agentSessionsTable,
			AgentSession.Model,
			{
				idColumn: "id",
				name: "AgentSession",
			},
		)
		const db = yield* Database.Database

		/**
		 * Find a session by ID.
		 * Only returns if not deleted.
		 */
		const findById = (id: AgentSessionId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: AgentSessionId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.agentSessionsTable)
								.where(
									and(
										eq(schema.agentSessionsTable.id, data.id),
										isNull(schema.agentSessionsTable.deletedAt),
									),
								),
						),
					policyRequire("AgentSession", "select"),
				)({ id }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Find all sessions for a sandbox.
		 * Optionally filter by status.
		 */
		const findAllBySandbox = (
			sandboxId: SandboxId,
			status?: AgentSession.AgentSessionStatus,
			tx?: TxFn,
		) =>
			db.makeQuery(
				(execute, data: { sandboxId: SandboxId; status?: AgentSession.AgentSessionStatus }) =>
					execute((client) => {
						const conditions = [
							eq(schema.agentSessionsTable.sandboxId, data.sandboxId),
							isNull(schema.agentSessionsTable.deletedAt),
						]
						if (data.status) {
							conditions.push(eq(schema.agentSessionsTable.status, data.status))
						}
						return client
							.select()
							.from(schema.agentSessionsTable)
							.where(and(...conditions))
							.orderBy(schema.agentSessionsTable.createdAt)
					}),
				policyRequire("AgentSession", "select"),
			)({ sandboxId, status }, tx)

		/**
		 * Find active sessions for a sandbox.
		 */
		const findActiveBySandbox = (sandboxId: SandboxId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { sandboxId: SandboxId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.agentSessionsTable)
							.where(
								and(
									eq(schema.agentSessionsTable.sandboxId, data.sandboxId),
									or(
										eq(schema.agentSessionsTable.status, "active"),
										eq(schema.agentSessionsTable.status, "creating"),
										eq(schema.agentSessionsTable.status, "waiting_input"),
									),
									isNull(schema.agentSessionsTable.deletedAt),
								),
							)
							.orderBy(schema.agentSessionsTable.createdAt),
					),
				policyRequire("AgentSession", "select"),
			)({ sandboxId }, tx)

		/**
		 * Find all sessions for a user.
		 */
		const findAllByUser = (userId: UserId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { userId: UserId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.agentSessionsTable)
							.where(
								and(
									eq(schema.agentSessionsTable.userId, data.userId),
									isNull(schema.agentSessionsTable.deletedAt),
								),
							)
							.orderBy(schema.agentSessionsTable.createdAt),
					),
				policyRequire("AgentSession", "select"),
			)({ userId }, tx)

		/**
		 * Update session status.
		 */
		const updateStatus = (id: AgentSessionId, status: AgentSession.AgentSessionStatus, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: AgentSessionId; status: AgentSession.AgentSessionStatus }) =>
						execute((client) =>
							client
								.update(schema.agentSessionsTable)
								.set({
									status: data.status,
									updatedAt: new Date(),
									endedAt: ["completed", "failed", "cancelled"].includes(data.status)
										? new Date()
										: undefined,
								})
								.where(eq(schema.agentSessionsTable.id, data.id))
								.returning(),
						),
					policyRequire("AgentSession", "update"),
				)({ id, status }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Update last message for a session.
		 */
		const updateLastMessage = (id: AgentSessionId, lastMessage: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: AgentSessionId; lastMessage: string }) =>
						execute((client) =>
							client
								.update(schema.agentSessionsTable)
								.set({
									lastMessage: data.lastMessage,
									updatedAt: new Date(),
								})
								.where(eq(schema.agentSessionsTable.id, data.id))
								.returning(),
						),
					policyRequire("AgentSession", "update"),
				)({ id, lastMessage }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Soft delete a session.
		 */
		const softDelete = (id: AgentSessionId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { id: AgentSessionId }) =>
					execute((client) =>
						client
							.update(schema.agentSessionsTable)
							.set({
								deletedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(eq(schema.agentSessionsTable.id, data.id))
							.returning(),
					),
				policyRequire("AgentSession", "delete"),
			)({ id }, tx)

		/**
		 * End all active sessions for a sandbox (used when sandbox is destroyed).
		 */
		const endAllForSandbox = (sandboxId: SandboxId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { sandboxId: SandboxId }) =>
					execute((client) =>
						client
							.update(schema.agentSessionsTable)
							.set({
								status: "cancelled",
								endedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(
								and(
									eq(schema.agentSessionsTable.sandboxId, data.sandboxId),
									or(
										eq(schema.agentSessionsTable.status, "active"),
										eq(schema.agentSessionsTable.status, "creating"),
										eq(schema.agentSessionsTable.status, "waiting_input"),
									),
								),
							)
							.returning(),
					),
				policyRequire("AgentSession", "update"),
			)({ sandboxId }, tx)

		return {
			...baseRepo,
			findById,
			findAllBySandbox,
			findActiveBySandbox,
			findAllByUser,
			updateStatus,
			updateLastMessage,
			softDelete,
			endAllForSandbox,
		} as const
	}),
	dependencies: [DatabaseLive],
}) {}
