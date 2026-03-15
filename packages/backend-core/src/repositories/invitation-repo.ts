import { and, Database, eq, lte, ModelRepository, schema, type TxFn } from "@hazel/db"

import type { InvitationId, OrganizationId, WorkOSInvitationId } from "@hazel/schema"
import { Invitation } from "@hazel/domain/models"
import { ServiceMap, Effect, Option, type Schema } from "effect"

export class InvitationRepo extends ServiceMap.Service<InvitationRepo>()("InvitationRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.invitationsTable, Invitation.Model, {
			idColumn: "id",
			name: "Invitation",
		})
		const db = yield* Database.Database

		const findByWorkosId = (workosInvitationId: WorkOSInvitationId, tx?: TxFn) =>
			db
				.makeQuery((execute, id: WorkOSInvitationId) =>
					execute((client) =>
						client
							.select()
							.from(schema.invitationsTable)
							.where(eq(schema.invitationsTable.workosInvitationId, id))
							.limit(1),
					),
				)(workosInvitationId, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const upsertByWorkosId = (data: Schema.Schema.Type<typeof Invitation.Insert>, tx?: TxFn) =>
			db
				.makeQuery((execute, input: typeof data) =>
					execute((client) =>
						client
							.insert(schema.invitationsTable)
							.values(input)
							.onConflictDoUpdate({
								target: schema.invitationsTable.workosInvitationId,
								set: {
									status: input.status,
									acceptedAt: input.acceptedAt,
									acceptedBy: input.acceptedBy,
								},
							})
							.returning(),
					),
				)(data, tx)
				.pipe(Effect.map((results) => results[0]))

		const findAllByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery((execute, id: OrganizationId) =>
				execute((client) =>
					client
						.select()
						.from(schema.invitationsTable)
						.where(eq(schema.invitationsTable.organizationId, id)),
				),
			)(organizationId, tx)

		const findPendingByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery((execute, id: OrganizationId) =>
				execute((client) =>
					client
						.select()
						.from(schema.invitationsTable)
						.where(
							and(
								eq(schema.invitationsTable.organizationId, id),
								eq(schema.invitationsTable.status, "pending"),
							),
						),
				),
			)(organizationId, tx)

		const updateStatus = (
			id: InvitationId,
			status: "pending" | "accepted" | "expired" | "revoked",
			tx?: TxFn,
		) =>
			db
				.makeQuery((execute, data: { id: InvitationId; status: typeof status }) =>
					execute((client) =>
						client
							.update(schema.invitationsTable)
							.set({ status: data.status })
							.where(eq(schema.invitationsTable.id, data.id))
							.returning(),
					),
				)({ id, status }, tx)
				.pipe(Effect.map((results) => results[0]))

		const markExpired = (tx?: TxFn) => {
			const now = new Date()
			return db.makeQuery((execute, _data) =>
				execute((client) =>
					client
						.update(schema.invitationsTable)
						.set({ status: "expired" })
						.where(
							and(
								eq(schema.invitationsTable.status, "pending"),
								lte(schema.invitationsTable.expiresAt, now),
							),
						)
						.returning(),
				),
			)({}, tx)
		}

		const bulkUpsertByWorkosId = (invitations: Schema.Schema.Type<typeof Invitation.Insert>[]) =>
			Effect.forEach(invitations, (data) => upsertByWorkosId(data), { concurrency: 10 })

		return {
			...baseRepo,
			findByWorkosId,
			upsertByWorkosId,
			findAllByOrganization,
			findPendingByOrganization,
			updateStatus,
			markExpired,
			bulkUpsertByWorkosId,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
