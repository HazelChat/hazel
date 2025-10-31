import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { Organization } from "@hazel/db/models"
import { type OrganizationId, policyRequire } from "@hazel/db/schema"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class OrganizationRepo extends Effect.Service<OrganizationRepo>()("OrganizationRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.organizationsTable,
			Organization.Model,
			{
				idColumn: "id",
				name: "Organization",
			},
		)
		const db = yield* Database.Database

		const findBySlug = (slug: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, slugValue: string) =>
						execute((client) =>
							client
								.select()
								.from(schema.organizationsTable)
								.where(eq(schema.organizationsTable.slug, slugValue))
								.limit(1),
						),
					policyRequire("Organization", "select"),
				)(slug, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const findAllActive = (tx?: TxFn) =>
			db.makeQuery(
				(execute, _data: {}) =>
					execute((client) =>
						client
							.select()
							.from(schema.organizationsTable)
							.where(isNull(schema.organizationsTable.deletedAt)),
					),
				policyRequire("Organization", "select"),
			)({}, tx)

		const softDelete = (id: OrganizationId, tx?: TxFn) =>
			db.makeQuery(
				(execute, orgId: OrganizationId) =>
					execute((client) =>
						client
							.update(schema.organizationsTable)
							.set({ deletedAt: new Date() })
							.where(
								and(
									eq(schema.organizationsTable.id, orgId),
									isNull(schema.organizationsTable.deletedAt),
								),
							),
					),
				policyRequire("Organization", "delete"),
			)(id, tx)

		return {
			...baseRepo,
			findBySlug,
			findAllActive,
			softDelete,
		}
	}),
	dependencies: [DatabaseLive],
}) {}
