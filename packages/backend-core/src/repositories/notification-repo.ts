import { and, Database, eq, inArray, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type ChannelId, type MessageId, type OrganizationMemberId, policyRequire } from "@hazel/domain"
import { Notification } from "@hazel/domain/models"
import { Effect } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class NotificationRepo extends Effect.Service<NotificationRepo>()("NotificationRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.notificationsTable,
			Notification.Model,
			{
				idColumn: "id",
				name: "Notification",
			},
		)
		const db = yield* Database.Database

		/**
		 * Delete notifications by message IDs for a specific member.
		 * Used when messages become visible in the viewport.
		 *
		 * Note: Authorization is handled at the handler level by verifying
		 * the user is a member of the organization. The memberId parameter
		 * ensures users can only delete their own notifications.
		 * The caller must use withSystemActor to satisfy the policy requirement.
		 */
		const deleteByMessageIds = (
			messageIds: readonly MessageId[],
			memberId: OrganizationMemberId,
			tx?: TxFn,
		) =>
			db.makeQuery(
				(execute, data: { messageIds: readonly MessageId[]; memberId: OrganizationMemberId }) =>
					execute((client) =>
						client
							.delete(schema.notificationsTable)
							.where(
								and(
									inArray(schema.notificationsTable.resourceId, [...data.messageIds]),
									eq(schema.notificationsTable.resourceType, "message"),
									eq(schema.notificationsTable.memberId, data.memberId),
								),
							)
							.returning(),
					),
				policyRequire("Notification", "delete"),
			)({ messageIds, memberId }, tx)

		/**
		 * Delete all notifications for a specific channel and member.
		 * Used when clearing notifications for a channel (e.g., when entering a channel).
		 *
		 * Note: Authorization is handled at the handler level by verifying
		 * the user is a member of the channel. The memberId parameter
		 * ensures users can only delete their own notifications.
		 * The caller must use withSystemActor to satisfy the policy requirement.
		 */
		const deleteByChannelId = (channelId: ChannelId, memberId: OrganizationMemberId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { channelId: ChannelId; memberId: OrganizationMemberId }) =>
					execute((client) =>
						client
							.delete(schema.notificationsTable)
							.where(
								and(
									eq(schema.notificationsTable.targetedResourceId, data.channelId),
									eq(schema.notificationsTable.targetedResourceType, "channel"),
									eq(schema.notificationsTable.memberId, data.memberId),
								),
							)
							.returning(),
					),
				policyRequire("Notification", "delete"),
			)({ channelId, memberId }, tx)

		return {
			...baseRepo,
			deleteByMessageIds,
			deleteByChannelId,
		} as const
	}),
}) {}
