import {
	and,
	or,
	Database,
	desc,
	eq,
	gt,
	isNull,
	lt,
	ModelRepository,
	schema,
	type TransactionClient,
} from "@hazel/db"
import { type ChannelId, type MessageId, policyRequire } from "@hazel/domain"
import { Message } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

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

		return {
			...baseRepo,
			listByChannel,
			findByIdForCursor,
		}
	}),
	dependencies: [DatabaseLive],
}) {}
