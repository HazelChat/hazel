import { and, Database, eq, inArray, ModelRepository, schema, type TxFn } from "@hazel/db"

import type { ChannelId, MessageId, OrganizationMemberId } from "@hazel/schema"
import { Notification } from "@hazel/domain/models"
import { ServiceMap, Effect } from "effect"

export class NotificationRepo extends ServiceMap.Service<NotificationRepo>()("NotificationRepo", {
	make: Effect.gen(function* () {
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
		 * The caller is responsible for authorization.
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
			)({ messageIds, memberId }, tx)

		/**
		 * Delete all notifications for a specific channel and member.
		 * Used when clearing notifications for a channel (e.g., when entering a channel).
		 *
		 * Note: Authorization is handled at the handler level by verifying
		 * the user is a member of the channel. The memberId parameter
		 * ensures users can only delete their own notifications.
		 * The caller is responsible for authorization.
		 */
		const deleteByChannelId = (channelId: ChannelId, memberId: OrganizationMemberId, tx?: TxFn) =>
			db.makeQuery((execute, data: { channelId: ChannelId; memberId: OrganizationMemberId }) =>
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
			)({ channelId, memberId }, tx)

		return {
			...baseRepo,
			deleteByMessageIds,
			deleteByChannelId,
		} as const
	}),
}) {}
