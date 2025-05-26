// import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
// import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
// import { Effect, Layer, Schema } from "effect"
// import { MessageRepository } from "./repo"
// import { ScyllaService } from "./scylladb"

// const CreateMessageSchema = Schema.Struct({
// 	content: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(4000)),
// 	channelId: Schema.String,
// 	threadChannelId: Schema.optional(Schema.String),
// 	authorId: Schema.String,
// 	replyToMessageId: Schema.optional(Schema.String),
// 	attachedFiles: Schema.optional(Schema.Array(Schema.String)),
// })

// const UpdateMessageSchema = Schema.Struct({
// 	content: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(4000)),
// 	attachedFiles: Schema.optional(Schema.Array(Schema.String)),
// })

// const MessageSchema = Schema.Struct({
// 	id: Schema.String,
// 	content: Schema.String,
// 	channelId: Schema.String,
// 	threadChannelId: Schema.NullOr(Schema.String),
// 	authorId: Schema.String,
// 	replyToMessageId: Schema.NullOr(Schema.String),
// 	attachedFiles: Schema.Array(Schema.String),
// 	createdAt: Schema.DateFromSelf,
// 	updatedAt: Schema.DateFromSelf,
// })

// const PaginatedMessagesSchema = Schema.Struct({
// 	messages: Schema.Array(MessageSchema),
// 	nextCursor: Schema.optional(Schema.String),
// 	hasMore: Schema.Boolean,
// })

// const ErrorSchema = Schema.Struct({
// 	error: Schema.String,
// 	message: Schema.String,
// })

// const MessagesApi = HttpApiGroup.make("messages")
// 	.add(
// 		HttpApiEndpoint.post("createMessage", "/messages")
// 			.setPayload(CreateMessageSchema)
// 			.addSuccess(MessageSchema)
// 			.addError(ErrorSchema, { status: 400 }),
// 	)
// 	.add(
// 		HttpApiEndpoint.get("getMessage", "/messages/:messageId")
// 			.addSuccess(MessageSchema)
// 			.addError(ErrorSchema, { status: 404 }),
// 	)
// 	.add(
// 		HttpApiEndpoint.put("updateMessage", "/messages/:messageId")
// 			.setPayload(UpdateMessageSchema)
// 			.addSuccess(MessageSchema)
// 			.addError(ErrorSchema, { status: 400 })
// 			.addError(ErrorSchema, { status: 404 }),
// 	)
// 	.add(
// 		HttpApiEndpoint.del("deleteMessage", "/messages/:messageId")
// 			.addSuccess(Schema.Struct({ success: Schema.Boolean }))
// 			.addError(ErrorSchema, { status: 404 }),
// 	)
// 	.add(
// 		HttpApiEndpoint.get("getMessages", "/channels/:channelId/messages")
// 			.addSuccess(PaginatedMessagesSchema)
// 			.addError(ErrorSchema, { status: 400 }),
// 	)

// const Api = HttpApi.make("MessageApi").add(MessagesApi)

// const MessagesApiLive = HttpApiBuilder.group(Api, "messages", (handlers) =>
// 	Effect.gen(function* () {
// 		const messageRepo = yield* MessageRepository

// 		return handlers
// 			.handle("createMessage", ({ payload }) =>
// 				Effect.gen(function* () {
// 					const message = yield* messageRepo.create({
// 						content: payload.content,
// 						channelId: payload.channelId,
// 						threadChannelId: payload.threadChannelId,
// 						authorId: payload.authorId,
// 						replyToMessageId: payload.replyToMessageId,
// 						attachedFiles: payload.attachedFiles,
// 					})
// 					return message
// 				}).pipe(
// 					Effect.catchAll((error) =>
// 						Effect.fail({
// 							error: "CreateMessageError",
// 							message: error.message,
// 						}),
// 					),
// 				),
// 			)
// 			.handle("getMessage", ({ path: { messageId } }) =>
// 				Effect.gen(function* () {
// 					const message = yield* messageRepo.getById(messageId)
// 					if (!message) {
// 						return yield* Effect.fail({
// 							error: "MessageNotFound",
// 							message: `Message with id ${messageId} not found`,
// 						})
// 					}
// 					return message
// 				}).pipe(
// 					Effect.catchAll((error) =>
// 						Effect.fail({
// 							error: "GetMessageError",
// 							message: error.message,
// 						}),
// 					),
// 				),
// 			)
// 			.handle("updateMessage", ({ path: { messageId }, payload }) =>
// 				Effect.gen(function* () {
// 					const message = yield* messageRepo.update({
// 						messageId,
// 						content: payload.content,
// 						attachedFiles: payload.attachedFiles,
// 					})
// 					return message
// 				}).pipe(
// 					Effect.catchTag("MessageNotFoundError", (error) =>
// 						Effect.fail({
// 							error: "MessageNotFound",
// 							message: error.message,
// 						}),
// 					),
// 					Effect.catchAll((error) =>
// 						Effect.fail({
// 							error: "UpdateMessageError",
// 							message: error.message,
// 						}),
// 					),
// 				),
// 			)
// 			.handle("deleteMessage", ({ path: { messageId } }) =>
// 				Effect.gen(function* () {
// 					yield* messageRepo.delete(messageId)
// 					return { success: true }
// 				}).pipe(
// 					Effect.catchAll((error) =>
// 						Effect.fail({
// 							error: "DeleteMessageError",
// 							message: error.message,
// 						}),
// 					),
// 				),
// 			)
// 			.handle("getMessages", ({ path: { channelId }, urlParams }) =>
// 				Effect.gen(function* () {
// 					const cursor = urlParams.cursor
// 					const limit = urlParams.limit ? Number.parseInt(urlParams.limit) : 50

// 					if (limit > 100) {
// 						return yield* Effect.fail({
// 							error: "InvalidLimit",
// 							message: "Limit cannot exceed 100",
// 						})
// 					}

// 					const result = yield* messageRepo.getByChannel(channelId, cursor, limit)
// 					return result
// 				}).pipe(
// 					Effect.catchAll((error) =>
// 						Effect.fail({
// 							error: "GetChannelMessagesError",
// 							message: error.message,
// 						}),
// 					),
// 				),
// 			)
// 	}),
// )

// const HttpLive = HttpApiBuilder.api(Api).pipe(
// 	Layer.provide(MessagesApiLive),
// 	Layer.provide(MessageRepository.Default),
// 	Layer.provide(ScyllaService.Default),
// )

// const ServerLive = HttpApiBuilder.serve().pipe(
// 	Layer.provide(HttpLive),
// 	Layer.provide(BunHttpServer.layer({ port: 3000 })),
// )

// Layer.launch(ServerLive).pipe(BunRuntime.runMain)
