import { Activity } from "@effect/workflow"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import { Cluster, type MessageId } from "@hazel/domain"
import { Effect, Option, Schema } from "effect"
import { buildGitHubEmbed, mapEventType, matchesBranchFilter } from "../lib/github-embed-builder.ts"
import { BotUserService } from "../services/bot-user-service.ts"

export const GitHubWebhookWorkflowLayer = Cluster.GitHubWebhookWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.GitHubWebhookWorkflowPayload) {
		yield* Effect.log(
			`Starting GitHubWebhookWorkflow for ${payload.eventType} event on ${payload.repositoryFullName}`,
		)

		// Map GitHub event type to our internal event type
		const internalEventType = mapEventType(payload.eventType)
		if (!internalEventType) {
			yield* Effect.log(`Ignoring unsupported event type: ${payload.eventType}`)
			return
		}

		// Activity 1: Get all subscriptions for this repository
		const subscriptionsResult = yield* Activity.make({
			name: "GetGitHubSubscriptions",
			success: Cluster.GetGitHubSubscriptionsResult,
			error: Cluster.GetGitHubSubscriptionsError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				yield* Effect.log(`Querying subscriptions for repository ${payload.repositoryId}`)

				const subscriptions = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.githubSubscriptionsTable.id,
								channelId: schema.githubSubscriptionsTable.channelId,
								enabledEvents: schema.githubSubscriptionsTable.enabledEvents,
								branchFilter: schema.githubSubscriptionsTable.branchFilter,
							})
							.from(schema.githubSubscriptionsTable)
							.where(
								and(
									eq(schema.githubSubscriptionsTable.repositoryId, payload.repositoryId),
									eq(schema.githubSubscriptionsTable.isEnabled, true),
									isNull(schema.githubSubscriptionsTable.deletedAt),
								),
							),
					)
					.pipe(Effect.orDie)

				yield* Effect.log(
					`Found ${subscriptions.length} subscriptions for repository ${payload.repositoryId}`,
				)

				return {
					subscriptions: subscriptions.map((s) => ({
						id: s.id,
						channelId: s.channelId,
						enabledEvents: s.enabledEvents as Cluster.GitHubEventType[],
						branchFilter: s.branchFilter,
					})),
					totalCount: subscriptions.length,
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("GetGitHubSubscriptions activity failed", { error: err }),
			),
			Effect.orDie,
		)

		// Extract ref from payload for branch filtering
		const eventPayload = payload.eventPayload as { ref?: string }
		const ref = eventPayload.ref

		// Filter subscriptions by event type and branch filter
		const eligibleSubscriptions = subscriptionsResult.subscriptions.filter((sub) => {
			// Check if event type is enabled
			if (!sub.enabledEvents.includes(internalEventType)) {
				return false
			}

			// For push events, check branch filter
			if (payload.eventType === "push" && !matchesBranchFilter(sub.branchFilter, ref)) {
				return false
			}

			return true
		})

		if (eligibleSubscriptions.length === 0) {
			yield* Effect.log("No eligible subscriptions after filtering, workflow complete")
			return
		}

		yield* Effect.log(`${eligibleSubscriptions.length} subscriptions are eligible for this event`)

		// Build the embed for this event
		const embed = buildGitHubEmbed(payload.eventType, payload.eventPayload)
		if (!embed) {
			yield* Effect.log(`Could not build embed for event type: ${payload.eventType}`)
			return
		}

		// Activity 2: Create messages in subscribed channels
		const messagesResult = yield* Activity.make({
			name: "CreateGitHubMessages",
			success: Cluster.CreateGitHubMessagesResult,
			error: Schema.Union(Cluster.CreateGitHubMessageError),
			execute: Effect.gen(function* () {
				const db = yield* Database.Database
				const botUserService = yield* BotUserService
				const messageIds: MessageId[] = []

				yield* Effect.log(`Creating messages in ${eligibleSubscriptions.length} channels`)

				// Get the GitHub bot user ID from cache
				const botUserOption = yield* botUserService.getGitHubBotUserId()

				if (Option.isNone(botUserOption)) {
					yield* Effect.logWarning("GitHub bot user not found, cannot create messages")
					return { messageIds: [], messagesCreated: 0 }
				}

				const botUserId = botUserOption.value

				// Create a message in each eligible channel
				for (const subscription of eligibleSubscriptions) {
					const messageResult = yield* db
						.execute((client) =>
							client
								.insert(schema.messagesTable)
								.values({
									channelId: subscription.channelId,
									authorId: botUserId,
									content: "",
									embeds: [embed],
									replyToMessageId: null,
									threadChannelId: null,
									deletedAt: null,
								})
								.returning({ id: schema.messagesTable.id }),
						)
						.pipe(Effect.orDie)

					if (messageResult.length > 0) {
						messageIds.push(messageResult[0]!.id)
						yield* Effect.log(
							`Created message ${messageResult[0]!.id} in channel ${subscription.channelId}`,
						)
					}
				}

				return {
					messageIds,
					messagesCreated: messageIds.length,
				}
			}),
		}).pipe(
			Effect.tapError((err) => Effect.logError("CreateGitHubMessages activity failed", { error: err })),
			Effect.orDie,
		)

		yield* Effect.log(
			`GitHubWebhookWorkflow completed: ${messagesResult.messagesCreated} messages created for ${payload.eventType} event`,
		)
	}),
)
