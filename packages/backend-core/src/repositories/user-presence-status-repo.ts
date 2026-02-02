import {
	and,
	Database,
	eq,
	inArray,
	lt,
	ModelRepository,
	ne,
	schema,
	type TransactionClient,
} from "@hazel/db"
import { type ChannelId, policyRequire, type UserId } from "@hazel/domain"
import { UserPresenceStatus } from "@hazel/domain/models"
import { Effect, Option, type Schema } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class UserPresenceStatusRepo extends Effect.Service<UserPresenceStatusRepo>()(
	"UserPresenceStatusRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const db = yield* Database.Database
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.userPresenceStatusTable,
				UserPresenceStatus.Model,
				{
					idColumn: "id",
					name: "UserPresenceStatus",
				},
			)

			// Find status by user ID
			const findByUserId = (userId: UserId, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, _data) =>
							execute((client) =>
								client
									.select()
									.from(schema.userPresenceStatusTable)
									.where(eq(schema.userPresenceStatusTable.userId, userId))
									.limit(1),
							),
						policyRequire("UserPresenceStatus", "select"),
					)({ userId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			// Upsert user presence status
			const upsertByUserId = (data: Schema.Schema.Type<typeof UserPresenceStatus.Insert>, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, input: typeof data) =>
							execute((client) =>
								client
									.insert(schema.userPresenceStatusTable)
									.values(input)
									.onConflictDoUpdate({
										target: schema.userPresenceStatusTable.userId,
										set: {
											status: input.status,
											customMessage: input.customMessage,
											statusEmoji: input.statusEmoji,
											statusExpiresAt: input.statusExpiresAt,
											activeChannelId: input.activeChannelId,
											updatedAt: new Date(),
											lastSeenAt: new Date(),
										},
									})
									.returning(),
							),
						policyRequire("UserPresenceStatus", "create"),
					)(data, tx)
					.pipe(Effect.map((results) => results[0]))

			// Update active channel for user
			const updateActiveChannel = (
				params: {
					userId: UserId
					activeChannelId: ChannelId | null
				},
				tx?: TxFn,
			) =>
				db.makeQuery(
					(execute, _data) =>
						execute((client) =>
							client
								.update(schema.userPresenceStatusTable)
								.set({
									activeChannelId: params.activeChannelId,
									updatedAt: new Date(),
								})
								.where(eq(schema.userPresenceStatusTable.userId, params.userId))
								.returning(),
						),
					policyRequire("UserPresenceStatus", "update"),
				)(params, tx)

			// Update user status
			const updateStatus = (
				params: {
					userId: UserId
					status: "online" | "away" | "busy" | "dnd" | "offline"
					customMessage?: string | null
				},
				tx?: TxFn,
			) =>
				db.makeQuery(
					(execute, _data) =>
						execute((client) =>
							client
								.update(schema.userPresenceStatusTable)
								.set({
									status: params.status,
									customMessage: params.customMessage,
									updatedAt: new Date(),
								})
								.where(eq(schema.userPresenceStatusTable.userId, params.userId))
								.returning(),
						),
					policyRequire("UserPresenceStatus", "update"),
				)(params, tx)

			// Update heartbeat timestamp (lightweight operation for presence tracking)
			const updateHeartbeat = (userId: UserId, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, _data) =>
							execute((client) =>
								client
									.update(schema.userPresenceStatusTable)
									.set({
										lastSeenAt: new Date(),
									})
									.where(eq(schema.userPresenceStatusTable.userId, userId))
									.returning(),
							),
						policyRequire("UserPresenceStatus", "update"),
					)({ userId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			// Find users with stale heartbeats (for cron job cleanup)
			const findStaleUsers = (timeout: Date) =>
				db.execute((client) =>
					client
						.select({
							userId: schema.userPresenceStatusTable.userId,
							status: schema.userPresenceStatusTable.status,
							lastSeenAt: schema.userPresenceStatusTable.lastSeenAt,
						})
						.from(schema.userPresenceStatusTable)
						.where(
							and(
								lt(schema.userPresenceStatusTable.lastSeenAt, timeout),
								ne(schema.userPresenceStatusTable.status, "offline"),
							),
						),
				)

			// Batch update users to offline status
			const markUsersOffline = (userIds: UserId[]) =>
				db.execute((client) =>
					client
						.update(schema.userPresenceStatusTable)
						.set({
							status: "offline",
							updatedAt: new Date(),
						})
						.where(inArray(schema.userPresenceStatusTable.userId, userIds))
						.returning(),
				)

			return {
				...baseRepo,
				findByUserId,
				upsertByUserId,
				updateActiveChannel,
				updateStatus,
				updateHeartbeat,
				findStaleUsers,
				markUsersOffline,
			}
		}),
	},
) {}
