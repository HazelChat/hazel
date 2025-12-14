import { Activity } from "@effect/workflow"
import type { MessageEmbed as DbMessageEmbed } from "@hazel/db"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import { Cluster, Integrations, type MessageId, type UserId } from "@hazel/domain"
import { Effect, Schema } from "effect"

// GitHub event colors using semantic colors
const GITHUB_COLORS = {
	// Push events
	push: 0x2ea44f, // GitHub green

	// Pull request states
	pr_opened: 0x238636, // Green
	pr_closed: 0xda3633, // Red
	pr_merged: 0x8957e5, // Purple
	pr_draft: 0x6e7681, // Gray
	pr_ready: 0x238636, // Green

	// Issue states
	issue_opened: 0x238636, // Green
	issue_closed: 0xda3633, // Red
	issue_reopened: 0x238636, // Green

	// Release
	release: 0x1f6feb, // Blue

	// Deployment states
	deployment_success: 0x238636, // Green
	deployment_failure: 0xda3633, // Red
	deployment_pending: 0xdbab09, // Yellow

	// Workflow run states
	workflow_success: 0x238636, // Green
	workflow_failure: 0xda3633, // Red
	workflow_cancelled: 0x6e7681, // Gray
	workflow_pending: 0xdbab09, // Yellow
} as const

// Map GitHub event type to our internal event type
function mapEventType(githubEventType: string): Cluster.GitHubEventType | null {
	switch (githubEventType) {
		case "push":
			return "push"
		case "pull_request":
			return "pull_request"
		case "issues":
			return "issues"
		case "release":
			return "release"
		case "deployment_status":
			return "deployment_status"
		case "workflow_run":
			return "workflow_run"
		default:
			return null
	}
}

// Check if a push event matches the branch filter
function matchesBranchFilter(branchFilter: string | null, payload: any): boolean {
	if (!branchFilter) return true // No filter = all branches

	const ref = payload.ref as string | undefined
	if (!ref) return true

	const branch = ref.replace("refs/heads/", "")
	return branch === branchFilter
}

// Build embed for push event
function buildPushEmbed(payload: any): DbMessageEmbed {
	const commits = payload.commits ?? []
	const ref = payload.ref ?? ""
	const branch = ref.replace("refs/heads/", "")
	const repository = payload.repository
	const sender = payload.sender
	const commitCount = commits.length
	const githubConfig = Integrations.INTEGRATION_BOT_CONFIGS.github

	// Build commit list for fields (max 5 commits)
	const commitFields = commits.slice(0, 5).map((commit: any) => ({
		name: `\`${commit.id.slice(0, 7)}\``,
		value: commit.message.split("\n")[0].slice(0, 100),
		inline: false,
	}))

	return {
		title: repository.full_name,
		description: `**${commitCount}** commit${commitCount !== 1 ? "s" : ""} pushed to \`${branch}\``,
		url: payload.compare,
		color: GITHUB_COLORS.push,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: "GitHub",
			iconUrl: githubConfig.avatarUrl,
		},
		fields: commitFields.length > 0 ? commitFields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: "Push", color: GITHUB_COLORS.push },
	}
}

// Build embed for pull request event
function buildPullRequestEmbed(payload: any): DbMessageEmbed {
	const pr = payload.pull_request
	const action = payload.action
	const repository = payload.repository
	const sender = payload.sender
	const githubConfig = Integrations.INTEGRATION_BOT_CONFIGS.github

	// Determine color and badge based on action
	let color: number
	let badge: string
	if (pr.merged) {
		color = GITHUB_COLORS.pr_merged
		badge = "Merged"
	} else if (action === "closed") {
		color = GITHUB_COLORS.pr_closed
		badge = "Closed"
	} else if (pr.draft) {
		color = GITHUB_COLORS.pr_draft
		badge = "Draft"
	} else if (action === "ready_for_review") {
		color = GITHUB_COLORS.pr_ready
		badge = "Ready for Review"
	} else {
		color = GITHUB_COLORS.pr_opened
		badge = action.charAt(0).toUpperCase() + action.slice(1)
	}

	// Build fields
	const fields = []
	if (pr.additions !== undefined && pr.deletions !== undefined) {
		fields.push({
			name: "Changes",
			value: `+${pr.additions} / -${pr.deletions}`,
			inline: true,
		})
	}
	if (pr.labels && pr.labels.length > 0) {
		const labelText = pr.labels
			.slice(0, 3)
			.map((l: any) => l.name)
			.join(", ")
		fields.push({
			name: "Labels",
			value: labelText,
			inline: true,
		})
	}

	return {
		title: `#${pr.number} ${pr.title}`,
		description: pr.body ? pr.body.slice(0, 200) + (pr.body.length > 200 ? "..." : "") : undefined,
		url: pr.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: badge, color },
	}
}

// Build embed for issues event
function buildIssueEmbed(payload: any): DbMessageEmbed {
	const issue = payload.issue
	const action = payload.action
	const repository = payload.repository
	const sender = payload.sender
	const githubConfig = Integrations.INTEGRATION_BOT_CONFIGS.github

	// Determine color and badge
	let color: number
	let badge: string
	if (action === "closed") {
		color = GITHUB_COLORS.issue_closed
		badge = "Closed"
	} else if (action === "reopened") {
		color = GITHUB_COLORS.issue_reopened
		badge = "Reopened"
	} else {
		color = GITHUB_COLORS.issue_opened
		badge = action.charAt(0).toUpperCase() + action.slice(1)
	}

	// Build fields
	const fields = []
	if (issue.labels && issue.labels.length > 0) {
		const labelText = issue.labels
			.slice(0, 3)
			.map((l: any) => l.name)
			.join(", ")
		fields.push({
			name: "Labels",
			value: labelText,
			inline: true,
		})
	}

	return {
		title: `#${issue.number} ${issue.title}`,
		description: issue.body
			? issue.body.slice(0, 200) + (issue.body.length > 200 ? "..." : "")
			: undefined,
		url: issue.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: `Issue ${badge}`, color },
	}
}

// Build embed for release event
function buildReleaseEmbed(payload: any): DbMessageEmbed {
	const release = payload.release
	const repository = payload.repository
	const sender = payload.sender
	const githubConfig = Integrations.INTEGRATION_BOT_CONFIGS.github

	return {
		title: `${release.name || release.tag_name}`,
		description: release.body
			? release.body.slice(0, 300) + (release.body.length > 300 ? "..." : "")
			: undefined,
		url: release.html_url,
		color: GITHUB_COLORS.release,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: [
			{
				name: "Tag",
				value: release.tag_name,
				inline: true,
			},
			...(release.prerelease
				? [
						{
							name: "Pre-release",
							value: "Yes",
							inline: true,
						},
					]
				: []),
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Release", color: GITHUB_COLORS.release },
	}
}

// Build embed for deployment status event
function buildDeploymentEmbed(payload: any): DbMessageEmbed {
	const deploymentStatus = payload.deployment_status
	const deployment = payload.deployment
	const repository = payload.repository
	const sender = payload.sender
	const githubConfig = Integrations.INTEGRATION_BOT_CONFIGS.github

	const state = deploymentStatus.state
	let color: number
	if (state === "success") {
		color = GITHUB_COLORS.deployment_success
	} else if (state === "failure" || state === "error") {
		color = GITHUB_COLORS.deployment_failure
	} else {
		color = GITHUB_COLORS.deployment_pending
	}

	return {
		title: `Deployment ${state}`,
		description: deploymentStatus.description,
		url: deploymentStatus.target_url || deployment.url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: [
			{
				name: "Environment",
				value: deployment.environment,
				inline: true,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: `Deployment ${state}`, color },
	}
}

// Build embed for workflow run event
function buildWorkflowRunEmbed(payload: any): DbMessageEmbed {
	const workflowRun = payload.workflow_run
	const repository = payload.repository
	const sender = payload.sender
	const githubConfig = Integrations.INTEGRATION_BOT_CONFIGS.github

	const conclusion = workflowRun.conclusion
	let color: number
	if (conclusion === "success") {
		color = GITHUB_COLORS.workflow_success
	} else if (conclusion === "failure") {
		color = GITHUB_COLORS.workflow_failure
	} else if (conclusion === "cancelled") {
		color = GITHUB_COLORS.workflow_cancelled
	} else {
		color = GITHUB_COLORS.workflow_pending
	}

	// Format duration if available
	const startedAt = workflowRun.run_started_at ? new Date(workflowRun.run_started_at) : null
	const updatedAt = workflowRun.updated_at ? new Date(workflowRun.updated_at) : null
	let duration: string | undefined
	if (startedAt && updatedAt) {
		const durationMs = updatedAt.getTime() - startedAt.getTime()
		const minutes = Math.floor(durationMs / 60000)
		const seconds = Math.floor((durationMs % 60000) / 1000)
		duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
	}

	return {
		title: workflowRun.name,
		description: `Run #${workflowRun.run_number} ${conclusion || workflowRun.status}`,
		url: workflowRun.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: [
			{
				name: "Branch",
				value: workflowRun.head_branch,
				inline: true,
			},
			...(duration
				? [
						{
							name: "Duration",
							value: duration,
							inline: true,
						},
					]
				: []),
		],
		timestamp: new Date().toISOString(),
		badge: { text: conclusion || workflowRun.status, color },
	}
}

// Build embed for the GitHub event
function buildGitHubEmbed(eventType: string, payload: any): DbMessageEmbed | null {
	switch (eventType) {
		case "push":
			return buildPushEmbed(payload)
		case "pull_request":
			return buildPullRequestEmbed(payload)
		case "issues":
			return buildIssueEmbed(payload)
		case "release":
			return buildReleaseEmbed(payload)
		case "deployment_status":
			return buildDeploymentEmbed(payload)
		case "workflow_run":
			return buildWorkflowRunEmbed(payload)
		default:
			return null
	}
}

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
		}).pipe(Effect.orDie)

		// Filter subscriptions by event type and branch filter
		const eligibleSubscriptions = subscriptionsResult.subscriptions.filter((sub) => {
			// Check if event type is enabled
			if (!sub.enabledEvents.includes(internalEventType)) {
				return false
			}

			// For push events, check branch filter
			if (
				payload.eventType === "push" &&
				!matchesBranchFilter(sub.branchFilter, payload.eventPayload)
			) {
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
				const messageIds: MessageId[] = []

				yield* Effect.log(`Creating messages in ${eligibleSubscriptions.length} channels`)

				// Get or create the GitHub bot user ID
				// The bot user should already exist from the integration setup
				// We need to query for it
				const botUsers = yield* db
					.execute((client) =>
						client
							.select({ id: schema.usersTable.id })
							.from(schema.usersTable)
							.where(eq(schema.usersTable.externalId, "integration-bot-github"))
							.limit(1),
					)
					.pipe(Effect.orDie)

				if (botUsers.length === 0) {
					yield* Effect.log("GitHub bot user not found, cannot create messages")
					return { messageIds: [], messagesCreated: 0 }
				}

				const botUserId = botUsers[0]!.id as UserId

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
		}).pipe(Effect.orDie)

		yield* Effect.log(
			`GitHubWebhookWorkflow completed: ${messagesResult.messagesCreated} messages created for ${payload.eventType} event`,
		)
	}),
)
