import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type OrganizationId, policyRequire, type UserId, withSystemActor } from "@hazel/domain"
import { Organization } from "@hazel/domain/models"
import { Effect, Option, type Schema } from "effect"
import { ChannelMemberRepo } from "./channel-member-repo"
import { ChannelRepo } from "./channel-repo"

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
		const channelRepo = yield* ChannelRepo
		const channelMemberRepo = yield* ChannelMemberRepo

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

		const findBySlugIfPublic = (slug: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, slugValue: string) =>
						execute((client) =>
							client
								.select()
								.from(schema.organizationsTable)
								.where(
									and(
										eq(schema.organizationsTable.slug, slugValue),
										eq(schema.organizationsTable.isPublic, true),
										isNull(schema.organizationsTable.deletedAt),
									),
								)
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

		const setupDefaultChannels = (organizationId: OrganizationId, userId: UserId) =>
			Effect.gen(function* () {
				// Create default "general" channel
				const defaultChannel = yield* channelRepo
					.insert({
						name: "general",
						icon: null,
						type: "public",
						organizationId,
						parentChannelId: null,
						sectionId: null,
						deletedAt: null,
					})
					.pipe(
						Effect.map((res) => res[0]!),
						withSystemActor,
					)

				// Add creator as channel member
				yield* channelMemberRepo
					.insert({
						channelId: defaultChannel.id,
						userId,
						isHidden: false,
						isMuted: false,
						isFavorite: false,
						lastSeenMessageId: null,
						notificationCount: 0,
						joinedAt: new Date(),
						deletedAt: null,
					})
					.pipe(withSystemActor)

				return defaultChannel
			})

		return {
			...baseRepo,
			findBySlug,
			findBySlugIfPublic,
			findAllActive,
			softDelete,
			setupDefaultChannels,
		}
	}),
	dependencies: [ChannelRepo.Default, ChannelMemberRepo.Default],
}) {}
