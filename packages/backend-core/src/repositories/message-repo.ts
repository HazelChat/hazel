import {
	and,
	or,
	Database,
	desc,
	eq,
	gt,
	inArray,
	isNull,
	lt,
	ModelRepository,
	schema,
	type TransactionClient,
} from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import type { ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import { Message } from "@hazel/domain/models"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export interface ListByChannelParams {
	channelId: ChannelId
	/** Cursor tuple for older messages (fetch messages after this row in DESC order) */
	cursorBefore?: {
		id: MessageId
		createdAt: Date
	}
	/** Cursor tuple for newer messages (fetch messages before this row in DESC order) */
	cursorAfter?: {
		id: MessageId
		createdAt: Date
	}
	/** Maximum number of messages to return (fetch limit+1 to determine has_more) */
	limit: number
}

export class MessageRepo extends Effect.Service<MessageRepo>()("MessageRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.messagesTable, Message.Model, {
			idColumn: "id",
			name: "Message",
		})
		const db = yield* Database.Database

		/**
		 * List messages in a channel with cursor-based pagination (Stripe-style).
		 */
		const listByChannel = (params: ListByChannelParams, tx?: TxFn) =>
			db.makeQuery(
				(
					execute,
					data: {
						channelId: ChannelId
						limit: number
						cursorBefore?: {
							id: MessageId
							createdAt: Date
						}
						cursorAfter?: {
							id: MessageId
							createdAt: Date
						}
					},
				) =>
					execute((client) => {
						// Build the WHERE conditions
						const conditions = [
							eq(schema.messagesTable.channelId, data.channelId),
							isNull(schema.messagesTable.deletedAt),
						]
						if (data.cursorBefore) {
							conditions.push(
								or(
									lt(schema.messagesTable.createdAt, data.cursorBefore.createdAt),
									and(
										eq(schema.messagesTable.createdAt, data.cursorBefore.createdAt),
										lt(schema.messagesTable.id, data.cursorBefore.id),
									),
								)!,
							)
						}
						if (data.cursorAfter) {
							conditions.push(
								or(
									gt(schema.messagesTable.createdAt, data.cursorAfter.createdAt),
									and(
										eq(schema.messagesTable.createdAt, data.cursorAfter.createdAt),
										gt(schema.messagesTable.id, data.cursorAfter.id),
									),
								)!,
							)
						}

						return client
							.select()
							.from(schema.messagesTable)
							.where(and(...conditions))
							.orderBy(desc(schema.messagesTable.createdAt), desc(schema.messagesTable.id))
							.limit(data.limit + 1)
					}),
				policyRequire("Message", "select"),
			)(params, tx)

		/**
		 * Find a message by ID scoped to a channel for cursor resolution.
		 */
		const findByIdForCursor = (params: { id: MessageId; channelId: ChannelId }, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: MessageId; channelId: ChannelId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.messagesTable)
								.where(
									and(
										eq(schema.messagesTable.id, data.id),
										eq(schema.messagesTable.channelId, data.channelId),
										isNull(schema.messagesTable.deletedAt),
									),
								)
								.limit(1),
						),
					policyRequire("Message", "select"),
				)(params, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		/**
		 * Reassign message authors for external chat-synced messages scoped to a provider + org.
		 * Used when a user links/unlinks their external account and historical messages need re-attribution.
		 */
		const reassignExternalSyncedAuthors = (
			params: {
				organizationId: OrganizationId
				provider: string
				fromAuthorId: UserId
				toAuthorId: UserId
			},
			tx?: TxFn,
		) =>
			db.makeQuery(
				(
					execute,
					data: {
						organizationId: OrganizationId
						provider: string
						fromAuthorId: UserId
						toAuthorId: UserId
					},
				) =>
					execute(async (client) => {
						if (data.fromAuthorId === data.toAuthorId) {
							return 0
						}

						const externalLinkedMessageIds = client
							.select({
								hazelMessageId: schema.chatSyncMessageLinksTable.hazelMessageId,
							})
							.from(schema.chatSyncMessageLinksTable)
							.innerJoin(
								schema.chatSyncChannelLinksTable,
								and(
									eq(
										schema.chatSyncChannelLinksTable.id,
										schema.chatSyncMessageLinksTable.channelLinkId,
									),
									isNull(schema.chatSyncChannelLinksTable.deletedAt),
								),
							)
							.innerJoin(
								schema.chatSyncConnectionsTable,
								and(
									eq(
										schema.chatSyncConnectionsTable.id,
										schema.chatSyncChannelLinksTable.syncConnectionId,
									),
									isNull(schema.chatSyncConnectionsTable.deletedAt),
								),
							)
							.where(
								and(
									eq(schema.chatSyncMessageLinksTable.source, "external"),
									isNull(schema.chatSyncMessageLinksTable.deletedAt),
									eq(schema.chatSyncConnectionsTable.organizationId, data.organizationId),
									eq(schema.chatSyncConnectionsTable.provider, data.provider),
								),
							)

						const updatedMessages = await client
							.update(schema.messagesTable)
							.set({
								authorId: data.toAuthorId,
								updatedAt: new Date(),
							})
							.where(
								and(
									eq(schema.messagesTable.authorId, data.fromAuthorId),
									isNull(schema.messagesTable.deletedAt),
									inArray(schema.messagesTable.id, externalLinkedMessageIds),
								),
							)
							.returning({ id: schema.messagesTable.id })

						return updatedMessages.length
					}),
				policyRequire("Message", "update"),
			)(params, tx)

		return {
			...baseRepo,
			listByChannel,
			findByIdForCursor,
			reassignExternalSyncedAuthors,
		}
	}),
}) {}
