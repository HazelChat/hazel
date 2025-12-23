import { LanguageModel } from "@effect/ai"
import { Activity } from "@effect/workflow"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import { Cluster } from "@hazel/domain"
import { Effect } from "effect"

const NAMING_PROMPT = `You are a helpful assistant that generates concise, descriptive thread names.
Based on the conversation below, generate a short thread name (3-6 words max) that captures the main topic.
The name should be descriptive but brief, like a subject line.

Do not use quotes, colons, or special formatting. Just return the plain thread name.

Original message that started the thread:
Author: {originalAuthor}
Content: {originalContent}

Thread replies:
{threadMessages}

Generate a concise thread name:`

export const ThreadNamingWorkflowLayer = Cluster.ThreadNamingWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.ThreadNamingWorkflowPayload) {
		yield* Effect.log(`Starting ThreadNamingWorkflow for thread ${payload.threadChannelId}`)

		const contextResult = yield* Activity.make({
			name: "GetThreadContext",
			success: Cluster.GetThreadContextResult,
			error: Cluster.GetThreadContextError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				const threadChannel = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.channelsTable.id,
								name: schema.channelsTable.name,
								parentChannelId: schema.channelsTable.parentChannelId,
							})
							.from(schema.channelsTable)
							.where(eq(schema.channelsTable.id, payload.threadChannelId))
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.GetThreadContextError({
										threadChannelId: payload.threadChannelId,
										message: "Failed to query thread channel",
										cause: err,
									}),
								),
						}),
					)

				if (threadChannel.length === 0) {
					return yield* Effect.fail(
						new Cluster.GetThreadContextError({
							threadChannelId: payload.threadChannelId,
							message: "Thread channel not found",
						}),
					)
				}

				const thread = threadChannel[0]!

				// Get original message (the one with threadChannelId pointing to this thread)
				const originalMessage = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.messagesTable.id,
								content: schema.messagesTable.content,
								authorId: schema.messagesTable.authorId,
								createdAt: schema.messagesTable.createdAt,
								firstName: schema.usersTable.firstName,
								lastName: schema.usersTable.lastName,
							})
							.from(schema.messagesTable)
							.innerJoin(
								schema.usersTable,
								eq(schema.messagesTable.authorId, schema.usersTable.id),
							)
							.where(eq(schema.messagesTable.id, payload.originalMessageId))
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.GetThreadContextError({
										threadChannelId: payload.threadChannelId,
										message: "Failed to query original message",
										cause: err,
									}),
								),
						}),
					)

				if (originalMessage.length === 0) {
					return yield* Effect.fail(
						new Cluster.GetThreadContextError({
							threadChannelId: payload.threadChannelId,
							message: "Original message not found",
						}),
					)
				}

				const orig = originalMessage[0]!

				// Get thread messages (messages in the thread channel)
				const threadMessages = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.messagesTable.id,
								content: schema.messagesTable.content,
								authorId: schema.messagesTable.authorId,
								createdAt: schema.messagesTable.createdAt,
								firstName: schema.usersTable.firstName,
								lastName: schema.usersTable.lastName,
							})
							.from(schema.messagesTable)
							.innerJoin(
								schema.usersTable,
								eq(schema.messagesTable.authorId, schema.usersTable.id),
							)
							.where(
								and(
									eq(schema.messagesTable.channelId, payload.threadChannelId),
									isNull(schema.messagesTable.deletedAt),
								),
							)
							.orderBy(schema.messagesTable.createdAt)
							.limit(10), 
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.GetThreadContextError({
										threadChannelId: payload.threadChannelId,
										message: "Failed to query thread messages",
										cause: err,
									}),
								),
						}),
					)

				return {
					threadChannelId: payload.threadChannelId,
					currentName: thread.name,
					originalMessage: {
						id: orig.id,
						content: orig.content ?? "",
						authorId: orig.authorId,
						authorName: `${orig.firstName} ${orig.lastName}`.trim(),
						createdAt: orig.createdAt.toISOString(),
					},
					threadMessages: threadMessages.map((m) => ({
						id: m.id,
						content: m.content ?? "",
						authorId: m.authorId,
						authorName: `${m.firstName} ${m.lastName}`.trim(),
						createdAt: m.createdAt.toISOString(),
					})),
				}
			}),
		}).pipe(Effect.orDie)

		const nameResult = yield* Activity.make({
			name: "GenerateThreadName",
			success: Cluster.GenerateThreadNameResult,
			error: Cluster.GenerateThreadNameError,
			execute: Effect.gen(function* () {
				// Build the prompt
				const threadMessagesText = contextResult.threadMessages
					.map((m) => `${m.authorName}: ${m.content}`)
					.join("\n")

				const prompt = NAMING_PROMPT.replace(
					"{originalAuthor}",
					contextResult.originalMessage.authorName,
				)
					.replace("{originalContent}", contextResult.originalMessage.content)
					.replace("{threadMessages}", threadMessagesText || "(no replies yet)")

				// Call the AI model
				const response = yield* LanguageModel.generateText({
					prompt,
				}).pipe(
					Effect.catchAll((err) =>
						Effect.fail(
							new Cluster.GenerateThreadNameError({
								threadChannelId: payload.threadChannelId,
								message: "AI generation failed",
								cause: err,
							}),
						),
					),
				)

				// Clean up the response
				let threadName = response.text.trim()
				// Remove quotes if present
				threadName = threadName.replace(/^["']|["']$/g, "")
				// Truncate if too long (max 50 chars)
				if (threadName.length > 50) {
					threadName = threadName.substring(0, 47) + "..."
				}
				// Fallback if empty
				if (!threadName) {
					threadName = "Discussion"
				}

				yield* Effect.log(`Generated thread name: ${threadName}`)

				return { threadName }
			}),
		}).pipe(Effect.orDie)

		// Activity 3: Update thread name in database
		yield* Activity.make({
			name: "UpdateThreadName",
			success: Cluster.UpdateThreadNameResult,
			error: Cluster.UpdateThreadNameError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				yield* db
					.execute((client) =>
						client
							.update(schema.channelsTable)
							.set({
								name: nameResult.threadName,
								updatedAt: new Date(),
							})
							.where(eq(schema.channelsTable.id, payload.threadChannelId)),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.UpdateThreadNameError({
										threadChannelId: payload.threadChannelId,
										message: "Failed to update thread name",
										cause: err,
									}),
								),
						}),
					)

				yield* Effect.log(
					`Updated thread ${payload.threadChannelId} name from "${contextResult.currentName}" to "${nameResult.threadName}"`,
				)

				return {
					success: true,
					previousName: contextResult.currentName,
					newName: nameResult.threadName,
				}
			}),
		}).pipe(Effect.orDie)

		yield* Effect.log(`ThreadNamingWorkflow completed for thread ${payload.threadChannelId}`)
	}),
)
