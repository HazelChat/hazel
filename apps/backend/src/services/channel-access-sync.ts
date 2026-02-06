import { and, Database, eq, isNull, notInArray, schema } from "@hazel/db"
import type { ChannelId, OrganizationId, UserId } from "@hazel/schema"
import { Effect } from "effect"

export class ChannelAccessSyncService extends Effect.Service<ChannelAccessSyncService>()(
	"ChannelAccessSyncService",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const db = yield* Database.Database

			const upsertChannelUsers = Effect.fn("ChannelAccessSyncService.upsertChannelUsers")(function* (
				channelId: ChannelId,
				organizationId: OrganizationId,
				userIds: readonly UserId[],
			) {
				const dedupedUserIds = [...new Set(userIds)].sort()
				if (dedupedUserIds.length === 0) {
					yield* db.execute((client) =>
						client
							.delete(schema.channelAccessTable)
							.where(eq(schema.channelAccessTable.channelId, channelId)),
					)
					return
				}

				yield* db.execute((client) =>
					client
						.insert(schema.channelAccessTable)
						.values(
							dedupedUserIds.map((userId) => ({
								userId,
								channelId,
								organizationId,
							})),
						)
						.onConflictDoUpdate({
							target: [schema.channelAccessTable.userId, schema.channelAccessTable.channelId],
							set: {
								organizationId,
								updatedAt: new Date(),
							},
						}),
				)

				yield* db.execute((client) =>
					client
						.delete(schema.channelAccessTable)
						.where(
							and(
								eq(schema.channelAccessTable.channelId, channelId),
								notInArray(schema.channelAccessTable.userId, dedupedUserIds),
							),
						),
				)
			})

			const removeChannel = Effect.fn("ChannelAccessSyncService.removeChannel")(function* (
				channelId: ChannelId,
			) {
				yield* db.execute((client) =>
					client
						.delete(schema.channelAccessTable)
						.where(eq(schema.channelAccessTable.channelId, channelId)),
				)
			})

			const syncChannel = Effect.fn("ChannelAccessSyncService.syncChannel")(function* (
				channelId: ChannelId,
			) {
				const channels = yield* db.execute((client) =>
					client
						.select({
							id: schema.channelsTable.id,
							type: schema.channelsTable.type,
							organizationId: schema.channelsTable.organizationId,
							parentChannelId: schema.channelsTable.parentChannelId,
						})
						.from(schema.channelsTable)
						.where(
							and(
								eq(schema.channelsTable.id, channelId),
								isNull(schema.channelsTable.deletedAt),
							),
						)
						.limit(1),
				)

				const channel = channels[0]
				if (!channel) {
					yield* removeChannel(channelId)
					return
				}

				let userIds: readonly UserId[] = []

				if (channel.type === "public") {
					const members = yield* db.execute((client) =>
						client
							.select({ userId: schema.organizationMembersTable.userId })
							.from(schema.organizationMembersTable)
							.where(
								and(
									eq(
										schema.organizationMembersTable.organizationId,
										channel.organizationId,
									),
									isNull(schema.organizationMembersTable.deletedAt),
								),
							),
					)
					userIds = members.map((row) => row.userId)
				} else if (
					channel.type === "private" ||
					channel.type === "direct" ||
					channel.type === "single"
				) {
					const members = yield* db.execute((client) =>
						client
							.select({ userId: schema.channelMembersTable.userId })
							.from(schema.channelMembersTable)
							.innerJoin(
								schema.organizationMembersTable,
								and(
									eq(
										schema.organizationMembersTable.organizationId,
										channel.organizationId,
									),
									eq(
										schema.organizationMembersTable.userId,
										schema.channelMembersTable.userId,
									),
									isNull(schema.organizationMembersTable.deletedAt),
								),
							)
							.where(
								and(
									eq(schema.channelMembersTable.channelId, channel.id),
									isNull(schema.channelMembersTable.deletedAt),
								),
							),
					)
					userIds = members.map((row) => row.userId)
				} else if (channel.type === "thread") {
					if (!channel.parentChannelId) {
						yield* upsertChannelUsers(channel.id, channel.organizationId, [])
						return
					}
					const parentChannelId = channel.parentChannelId

					const parentAccess = yield* db.execute((client) =>
						client
							.select({ userId: schema.channelAccessTable.userId })
							.from(schema.channelAccessTable)
							.innerJoin(
								schema.organizationMembersTable,
								and(
									eq(
										schema.organizationMembersTable.organizationId,
										channel.organizationId,
									),
									eq(
										schema.organizationMembersTable.userId,
										schema.channelAccessTable.userId,
									),
									isNull(schema.organizationMembersTable.deletedAt),
								),
							)
							.where(
								and(
									eq(schema.channelAccessTable.channelId, parentChannelId),
									eq(schema.channelAccessTable.organizationId, channel.organizationId),
								),
							),
					)
					userIds = parentAccess.map((row) => row.userId)
				}

				yield* upsertChannelUsers(channel.id, channel.organizationId, userIds)
			})

			const syncChildThreads = Effect.fn("ChannelAccessSyncService.syncChildThreads")(function* (
				parentChannelId: ChannelId,
			) {
				const childThreads = yield* db.execute((client) =>
					client
						.select({ id: schema.channelsTable.id })
						.from(schema.channelsTable)
						.where(
							and(
								eq(schema.channelsTable.parentChannelId, parentChannelId),
								eq(schema.channelsTable.type, "thread"),
								isNull(schema.channelsTable.deletedAt),
							),
						),
				)

				yield* Effect.forEach(childThreads, (thread) => syncChannel(thread.id), { concurrency: 10 })
			})

			const syncUserInOrganization = Effect.fn("ChannelAccessSyncService.syncUserInOrganization")(
				function* (userId: UserId, organizationId: OrganizationId) {
					const activeMembership = yield* db.execute((client) =>
						client
							.select({ id: schema.organizationMembersTable.id })
							.from(schema.organizationMembersTable)
							.where(
								and(
									eq(schema.organizationMembersTable.organizationId, organizationId),
									eq(schema.organizationMembersTable.userId, userId),
									isNull(schema.organizationMembersTable.deletedAt),
								),
							)
							.limit(1),
					)

					if (activeMembership.length === 0) {
						yield* db.execute((client) =>
							client
								.delete(schema.channelAccessTable)
								.where(
									and(
										eq(schema.channelAccessTable.userId, userId),
										eq(schema.channelAccessTable.organizationId, organizationId),
									),
								),
						)
						return
					}

					const channels = yield* db.execute((client) =>
						client
							.select({
								id: schema.channelsTable.id,
								type: schema.channelsTable.type,
								parentChannelId: schema.channelsTable.parentChannelId,
							})
							.from(schema.channelsTable)
							.where(
								and(
									eq(schema.channelsTable.organizationId, organizationId),
									isNull(schema.channelsTable.deletedAt),
								),
							),
					)

					const membershipChannels = yield* db.execute((client) =>
						client
							.select({ channelId: schema.channelMembersTable.channelId })
							.from(schema.channelMembersTable)
							.innerJoin(
								schema.channelsTable,
								and(
									eq(schema.channelsTable.id, schema.channelMembersTable.channelId),
									eq(schema.channelsTable.organizationId, organizationId),
									isNull(schema.channelsTable.deletedAt),
								),
							)
							.where(
								and(
									eq(schema.channelMembersTable.userId, userId),
									isNull(schema.channelMembersTable.deletedAt),
								),
							),
					)

					const baseChannelIds = new Set<ChannelId>(
						channels.filter((channel) => channel.type === "public").map((channel) => channel.id),
					)
					for (const memberChannel of membershipChannels) {
						baseChannelIds.add(memberChannel.channelId)
					}

					const threadChannelIds = channels
						.filter(
							(channel) =>
								channel.type === "thread" &&
								channel.parentChannelId !== null &&
								baseChannelIds.has(channel.parentChannelId),
						)
						.map((channel) => channel.id)

					const desiredChannelIds = [...new Set([...baseChannelIds, ...threadChannelIds])].sort()

					if (desiredChannelIds.length === 0) {
						yield* db.execute((client) =>
							client
								.delete(schema.channelAccessTable)
								.where(
									and(
										eq(schema.channelAccessTable.userId, userId),
										eq(schema.channelAccessTable.organizationId, organizationId),
									),
								),
						)
						return
					}

					yield* db.execute((client) =>
						client
							.insert(schema.channelAccessTable)
							.values(
								desiredChannelIds.map((channelId) => ({
									userId,
									channelId,
									organizationId,
								})),
							)
							.onConflictDoUpdate({
								target: [
									schema.channelAccessTable.userId,
									schema.channelAccessTable.channelId,
								],
								set: {
									organizationId,
									updatedAt: new Date(),
								},
							}),
					)

					yield* db.execute((client) =>
						client
							.delete(schema.channelAccessTable)
							.where(
								and(
									eq(schema.channelAccessTable.userId, userId),
									eq(schema.channelAccessTable.organizationId, organizationId),
									notInArray(schema.channelAccessTable.channelId, desiredChannelIds),
								),
							),
					)
				},
			)

			return {
				syncChannel,
				syncChildThreads,
				syncUserInOrganization,
				removeChannel,
			}
		}),
	},
) {}
