import { and, Database, desc, eq, gt, inArray, isNull, schema, sql } from "@hazel/db"
import type { InvitationId, OrganizationId, UserId } from "@hazel/schema"
import { Context, Effect, Layer, Option } from "effect"

const table = schema.organizationInvitationsTable

export interface NewInvitation {
	readonly organizationId: OrganizationId
	readonly email: string
	readonly role: "admin" | "member"
	readonly tokenHash: string
	readonly invitedBy: UserId
	readonly expiresAt: Date
}

/** Email invitations to organizations (`organization_invitations`). */
export class InvitationRepo extends Context.Service<InvitationRepo>()("InvitationRepo", {
	make: Effect.gen(function* () {
		const db = yield* Database.Database

		/** A new pending invitation, or a fresh link for the address's pending one. */
		const upsertPending = (invitation: NewInvitation) =>
			db
				.makeQuery((execute, data: NewInvitation) =>
					execute((client) =>
						client
							.insert(table)
							.values({ ...data, status: "pending" })
							.onConflictDoUpdate({
								target: [table.organizationId, table.email],
								targetWhere: sql`${table.status} = 'pending'`,
								set: {
									role: data.role,
									tokenHash: data.tokenHash,
									invitedBy: data.invitedBy,
									expiresAt: data.expiresAt,
									updatedAt: new Date(),
								},
							})
							.returning(),
					),
				)(invitation)
				.pipe(Effect.map((rows) => rows[0]!))

		const listPending = (organizationId: OrganizationId, now: Date) =>
			db.makeQuery((execute, data: { organizationId: OrganizationId; now: Date }) =>
				execute((client) =>
					client
						.select()
						.from(table)
						.where(
							and(
								eq(table.organizationId, data.organizationId),
								eq(table.status, "pending"),
								gt(table.expiresAt, data.now),
							),
						)
						.orderBy(desc(table.createdAt)),
				),
			)({ organizationId, now })

		const findById = (id: InvitationId) =>
			db
				.makeQuery((execute, invitationId: InvitationId) =>
					execute((client) =>
						client.select().from(table).where(eq(table.id, invitationId)).limit(1),
					),
				)(id)
				.pipe(Effect.map((rows) => Option.fromNullishOr(rows[0])))

		const findByTokenHash = (tokenHash: string) =>
			db
				.makeQuery((execute, hash: string) =>
					execute((client) =>
						client.select().from(table).where(eq(table.tokenHash, hash)).limit(1),
					),
				)(tokenHash)
				.pipe(Effect.map((rows) => Option.fromNullishOr(rows[0])))

		/** Revokes a pending invitation; `None` when it was not pending. */
		const revoke = (id: InvitationId) =>
			db
				.makeQuery((execute, invitationId: InvitationId) =>
					execute((client) =>
						client
							.update(table)
							.set({ status: "revoked", updatedAt: new Date() })
							.where(and(eq(table.id, invitationId), eq(table.status, "pending")))
							.returning(),
					),
				)(id)
				.pipe(Effect.map((rows) => Option.fromNullishOr(rows[0])))

		/** Marks a pending invitation accepted; `None` when another request got there first. */
		const markAccepted = (id: InvitationId, userId: UserId) =>
			db
				.makeQuery((execute, data: { id: InvitationId; userId: UserId }) =>
					execute((client) =>
						client
							.update(table)
							.set({
								status: "accepted",
								acceptedBy: data.userId,
								acceptedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(and(eq(table.id, data.id), eq(table.status, "pending")))
							.returning(),
					),
				)({ id, userId })
				.pipe(Effect.map((rows) => Option.fromNullishOr(rows[0])))

		/** Which of these (lowercased) addresses already belong to a member of the organization. */
		const findMemberEmails = (organizationId: OrganizationId, emails: ReadonlyArray<string>) =>
			db
				.makeQuery(
					(execute, data: { organizationId: OrganizationId; emails: ReadonlyArray<string> }) =>
						execute((client) =>
							client
								.select({ email: sql<string>`lower(${schema.usersTable.email})` })
								.from(schema.organizationMembersTable)
								.innerJoin(
									schema.usersTable,
									eq(schema.usersTable.id, schema.organizationMembersTable.userId),
								)
								.where(
									and(
										eq(
											schema.organizationMembersTable.organizationId,
											data.organizationId,
										),
										isNull(schema.organizationMembersTable.deletedAt),
										inArray(sql`lower(${schema.usersTable.email})`, [...data.emails]),
									),
								),
						),
				)({ organizationId, emails })
				.pipe(Effect.map((rows) => new Set(rows.map((row) => row.email))))

		return {
			findMemberEmails,
			upsertPending,
			listPending,
			findById,
			findByTokenHash,
			revoke,
			markAccepted,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
