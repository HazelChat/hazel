import { and, count, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type OrganizationId, type OrganizationMemberId, policyRequire, type UserId } from "@hazel/domain"
import { OrganizationMember } from "@hazel/domain/models"
import { Effect, Option, type Schema } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class OrganizationMemberRepo extends Effect.Service<OrganizationMemberRepo>()(
	"OrganizationMemberRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.organizationMembersTable,
				OrganizationMember.Model,
				{
					idColumn: "id",
					name: "OrganizationMember",
				},
			)
			const db = yield* Database.Database

			// Extended methods for WorkOS sync
			const findByOrgAndUser = (organizationId: OrganizationId, userId: UserId, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, data: { organizationId: OrganizationId; userId: UserId }) =>
							execute((client) =>
								client
									.select()
									.from(schema.organizationMembersTable)
									.where(
										and(
											eq(
												schema.organizationMembersTable.organizationId,
												data.organizationId,
											),
											eq(schema.organizationMembersTable.userId, data.userId),
											isNull(schema.organizationMembersTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("OrganizationMember", "select"),
					)({ organizationId, userId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const upsertByOrgAndUser = (
				data: Schema.Schema.Type<typeof OrganizationMember.Insert>,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(execute, input: typeof data) =>
						execute(async (client) => {
							// Atomic upsert using onConflictDoUpdate to avoid race conditions
							const result = await client
								.insert(schema.organizationMembersTable)
								.values(input)
								.onConflictDoUpdate({
									target: [
										schema.organizationMembersTable.organizationId,
										schema.organizationMembersTable.userId,
									],
									set: {
										role: input.role,
										deletedAt: null,
									},
								})
								.returning()
							return result[0]
						}),
					policyRequire("OrganizationMember", "create"),
				)(data, tx)

			const findAllByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
				db.makeQuery(
					(execute, orgId: OrganizationId) =>
						execute((client) =>
							client
								.select()
								.from(schema.organizationMembersTable)
								.where(
									and(
										eq(schema.organizationMembersTable.organizationId, orgId),
										isNull(schema.organizationMembersTable.deletedAt),
									),
								),
						),
					policyRequire("OrganizationMember", "select"),
				)(organizationId, tx)

			const countByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, orgId: OrganizationId) =>
							execute((client) =>
								client
									.select({ count: count() })
									.from(schema.organizationMembersTable)
									.where(
										and(
											eq(schema.organizationMembersTable.organizationId, orgId),
											isNull(schema.organizationMembersTable.deletedAt),
										),
									),
							),
						policyRequire("OrganizationMember", "select"),
					)(organizationId, tx)
					.pipe(Effect.map((results) => results[0]?.count ?? 0))

			const findAllActive = (tx?: TxFn) =>
				db.makeQuery(
					(execute, _data: {}) =>
						execute((client) =>
							client
								.select()
								.from(schema.organizationMembersTable)
								.where(isNull(schema.organizationMembersTable.deletedAt)),
						),
					policyRequire("OrganizationMember", "select"),
				)({}, tx)

			const softDelete = (id: OrganizationMemberId, tx?: TxFn) =>
				db.makeQuery(
					(execute, memberId: OrganizationMemberId) =>
						execute((client) =>
							client
								.update(schema.organizationMembersTable)
								.set({ deletedAt: new Date() })
								.where(
									and(
										eq(schema.organizationMembersTable.id, memberId),
										isNull(schema.organizationMembersTable.deletedAt),
									),
								),
						),
					policyRequire("OrganizationMember", "delete"),
				)(id, tx)

			const softDeleteByOrgAndUser = (organizationId: OrganizationId, userId: UserId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { organizationId: OrganizationId; userId: UserId }) =>
						execute((client) =>
							client
								.update(schema.organizationMembersTable)
								.set({ deletedAt: new Date() })
								.where(
									and(
										eq(
											schema.organizationMembersTable.organizationId,
											data.organizationId,
										),
										eq(schema.organizationMembersTable.userId, data.userId),
										isNull(schema.organizationMembersTable.deletedAt),
									),
								),
						),
					policyRequire("OrganizationMember", "delete"),
				)({ organizationId, userId }, tx)

			const updateMetadata = (id: OrganizationMemberId, metadata: Record<string, any>, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, data: { id: OrganizationMemberId; metadata: Record<string, any> }) =>
							execute((client) =>
								client
									.update(schema.organizationMembersTable)
									.set({ metadata: data.metadata })
									.where(
										and(
											eq(schema.organizationMembersTable.id, data.id),
											isNull(schema.organizationMembersTable.deletedAt),
										),
									)
									.returning(),
							),
						policyRequire("OrganizationMember", "update"),
					)({ id, metadata }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const bulkUpsertByOrgAndUser = (
				members: Schema.Schema.Type<typeof OrganizationMember.Insert>[],
			) => Effect.forEach(members, (data) => upsertByOrgAndUser(data), { concurrency: 10 })

			return {
				...baseRepo,
				findByOrgAndUser,
				upsertByOrgAndUser,
				findAllByOrganization,
				countByOrganization,
				findAllActive,
				softDelete,
				softDeleteByOrgAndUser,
				updateMetadata,
				bulkUpsertByOrgAndUser,
			}
		}),
	},
) {}
