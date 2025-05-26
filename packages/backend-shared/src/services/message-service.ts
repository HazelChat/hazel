import { Model } from "@maki-chat/api-schema"
import { type ChannelId, Message, type MessageId } from "@maki-chat/api-schema/schema"
import { types } from "cassandra-driver"
import { Effect, Schema, pipe } from "effect"
import { MessageRepo } from "../repositories"
import { Database } from "./internal/database"

import { InternalServerError } from "@maki-chat/api-schema/errors.js"
import { schema } from "@maki-chat/drizzle"
import { and, desc, eq, lt } from "drizzle-orm"

export class MessageService extends Effect.Service<MessageService>()("@hazel/Message/Service", {
	effect: Effect.gen(function* () {
		const repo = yield* MessageRepo

		const db = yield* Database

		const create = Effect.fn("Message.create")(function* (
			channelId: ChannelId,
			message: typeof Message.jsonCreate.Type,
		) {
			yield* Effect.annotateCurrentSpan("message", message)

			const messageId = types.TimeUuid.now().toString() as MessageId

			const encodedCreateMessage = yield* Schema.encodeUnknown(Message.insert)({
				id: messageId,
				channelId,
				...message,
			}).pipe(
				Effect.catchTag(
					"ParseError",
					(err) =>
						new InternalServerError({
							title: "Error parsing message",
							detail: `An error occurred while parsing message for channel ${channelId}`,
							cause: err,
						}),
				),
			)

			const createdMessage = yield* db
				.execute((client) =>
					client
						.insert(schema.messages)
						// @ts-expect-error
						.values({ ...encodedCreateMessage })
						.returning(),
				)
				.pipe(
					Effect.catchTag(
						"DatabaseError",
						(err) =>
							new InternalServerError({
								title: "Error creating message",
								detail: `An error occurred while creating message for channel ${channelId}`,
								cause: err,
							}),
					),
				)

			return yield* Schema.decodeUnknown(Message)(createdMessage[0]!).pipe(
				Effect.catchTag(
					"ParseError",
					(err) =>
						new InternalServerError({
							title: "Error parsing message",
							detail: `An error occurred while parsing message for channel ${channelId}`,
							cause: err,
						}),
				),
			)
		})

		const findById = (id: MessageId) =>
			pipe(repo.findById(id), Effect.withSpan("Message.findById", { attributes: { id } }))

		const deleteMessage = (id: MessageId) =>
			pipe(
				repo.delete(id),
				Effect.withSpan("Message.delete", { attributes: { id } }),
				Effect.catchTag(
					"DatabaseError",
					(err) =>
						new InternalServerError({ title: "Error deleting message", cause: err, detail: err.message }),
				),
			)

		const update = Effect.fn("Message.update")(function* ({
			id,
			channelId,
			message,
		}: { id: MessageId; channelId: ChannelId; message: typeof Message.jsonUpdate.Type }) {
			yield* Effect.annotateCurrentSpan("id", id)

			yield* repo.updateVoid({
				id,
				channelId,
				...message,
				updatedAt: undefined,
			})
		})

		const paginate = Effect.fn("Message.paginate")(
			function* (
				channelId: ChannelId,
				params: {
					cursor: MessageId | null
					limit?: number
				},
			) {
				yield* Effect.annotateCurrentSpan("params", params)

				const actualLimit = Math.min(params.limit ?? 20, 100)
				const fetchLimit = actualLimit + 1

				let whereCondition = eq(schema.messages.channelId, channelId)

				if (params.cursor) {
					const cursorMessage = yield* db.execute((client) =>
						client
							.select({ createdAt: schema.messages.createdAt })
							.from(schema.messages)
							.where(eq(schema.messages.id, params.cursor!))
							.limit(1),
					)

					if (cursorMessage.length > 0) {
						whereCondition = and(
							eq(schema.messages.channelId, channelId),
							lt(schema.messages.createdAt, cursorMessage[0]!.createdAt!),
						)!
					}
				}
				const results = yield* db.execute((client) =>
					client
						.select()
						.from(schema.messages)
						.where(whereCondition)
						.orderBy(desc(schema.messages.createdAt), desc(schema.messages.id))
						.limit(fetchLimit),
				)

				const hasNext = results.length > actualLimit
				const data = hasNext ? results.slice(0, actualLimit) : results

				const hasPrevious = !!params.cursor

				const nextCursor = hasNext ? (data[data.length - 1]!.id as MessageId) : undefined
				const previousCursor = params.cursor

				const parsedData = yield* Schema.decodeUnknown(Schema.Array(Message))(data).pipe(
					Effect.catchTag(
						"ParseError",
						(err) =>
							new InternalServerError({
								title: "Error parsing messages",
								detail: `An error occurred while parsing messages for channel ${channelId} with cursor ${params.cursor} and limit ${params.limit}`,
								cause: err,
							}),
					),
				)

				return {
					data: parsedData,
					pagination: {
						hasNext,
						hasPrevious,
						nextCursor,
						previousCursor,
					},
				}
			},
			Effect.catchTag(
				"DatabaseError",
				(err) =>
					new InternalServerError({
						title: "Error paginating messages",
						detail: "An error occurred while paginating messages",
						cause: err,
					}),
			),
		)

		return { create, findById, delete: deleteMessage, update, paginate }
	}),
	dependencies: [MessageRepo.Default],
}) {}
