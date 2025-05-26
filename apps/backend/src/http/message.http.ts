import { HttpApiBuilder } from "@effect/platform"
import { Config, Effect, Option, Schema } from "effect"

import { MakiApi } from "@maki-chat/api-schema"
import { NotFound } from "@maki-chat/api-schema/errors.js"
import { Message } from "@maki-chat/api-schema/schema"
import { MessageService } from "@maki-chat/backend-shared/services"
import { schema } from "@maki-chat/drizzle"
import { drizzle } from "drizzle-orm/postgres-js"
import { getMessages } from "../services/drizzle"

export const MessageApiLive = HttpApiBuilder.group(MakiApi, "message", (handlers) =>
	Effect.gen(function* () {
		const messageService = yield* MessageService

		const databaseUrl = yield* Config.string("DATABASE_URL")

		return handlers
			.handle(
				"createMessage",
				Effect.fnUntraced(function* ({ payload, path }) {
					console.log("Message payload:", payload)
					const message = yield* messageService.create(path.channelId, payload)

					console.log("Message created:", message.id)
					return message
				}),
			)

			.handle(
				"getMessage",
				Effect.fnUntraced(function* ({ path }) {
					const message = yield* messageService
						.findById(path.id)
						.pipe(
							Effect.flatMap(
								Option.match({
									onNone: () =>
										Effect.fail(new NotFound({ entityType: "message", entityId: path.id })),
									onSome: Effect.succeed,
								}),
							),
						)
						.pipe(Effect.tapErrorCause((cause) => Effect.logError("Failed to get message", { cause })))

					return message
				}),
			)
			.handle(
				"updateMessage",
				Effect.fnUntraced(function* ({ path, payload }) {
					yield* messageService.update({ id: path.id, message: payload, channelId: path.channelId })
					return { success: true } as const
				}),
			)
			.handle(
				"deleteMessage",
				Effect.fnUntraced(function* ({ path }) {
					yield* messageService.delete(path.id)
					return { success: true }
				}),
			)
			.handle(
				"getMessages",
				Effect.fnUntraced(function* ({ urlParams, path }) {
					const result = yield* messageService.paginate(path.channelId, {
						cursor: urlParams.cursor || null,
						limit: urlParams.limit,
					})

					return {
						data: result.data,
						pagination: {
							hasNext: result.pagination.hasNext,
							hasPrevious: result.pagination.hasPrevious,
							nextCursor: result.pagination.nextCursor,
							previousCursor: result.pagination.previousCursor || undefined,
						},
					}
				}),
			)
	}),
)
