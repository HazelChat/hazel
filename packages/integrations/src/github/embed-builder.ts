import type { Schema } from "effect"
import { INTEGRATION_BOT_CONFIGS } from "../common/bot-configs.ts"
import type { MessageEmbed } from "../common/embed-types.ts"
import { GITHUB_COLORS } from "./colors.ts"
import {
	GitHubLabel,
	type GitHubDeploymentStatusPayload,
	type GitHubEventType,
	type GitHubIssuesPayload,
	type GitHubPullRequestPayload,
	type GitHubPushPayload,
	type GitHubReleasePayload,
	type GitHubWorkflowRunPayload,
} from "./payloads.ts"

// Infer the GitHubLabel type from the schema
type GitHubLabelType = Schema.Schema.Type<typeof GitHubLabel>

const githubConfig = INTEGRATION_BOT_CONFIGS.github

/**
 * Build embed for push event.
 */
export function buildPushEmbed(payload: GitHubPushPayload): MessageEmbed {
	const commits = payload.commits ?? []
	const ref = payload.ref ?? ""
	const branch = ref.replace("refs/heads/", "")
	const repository = payload.repository
	const sender = payload.sender
	const commitCount = commits.length

	// Build commit list for fields (max 5 commits)
	const commitFields = commits.slice(0, 5).map((commit) => {
		const message = commit.message ?? ""
		const firstLine = message.split("\n")[0] ?? ""
		return {
			name: `\`${commit.id.slice(0, 7)}\``,
			value: firstLine.slice(0, 100),
			inline: false,
		}
	})

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

/**
 * Build embed for pull request event.
 */
export function buildPullRequestEmbed(payload: GitHubPullRequestPayload): MessageEmbed {
	const pr = payload.pull_request
	const action = payload.action
	const repository = payload.repository
	const sender = payload.sender

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
			.map((l: GitHubLabelType) => l.name)
			.join(", ")
		fields.push({
			name: "Labels",
			value: labelText,
			inline: true,
		})
	}

	return {
		title: `#${pr.number} ${pr.title}`,
		description: pr.body ? `${pr.body.slice(0, 200)}${pr.body.length > 200 ? "..." : ""}` : undefined,
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

/**
 * Build embed for issues event.
 */
export function buildIssueEmbed(payload: GitHubIssuesPayload): MessageEmbed {
	const issue = payload.issue
	const action = payload.action
	const repository = payload.repository
	const sender = payload.sender

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
			.map((l: GitHubLabelType) => l.name)
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
			? `${issue.body.slice(0, 200)}${issue.body.length > 200 ? "..." : ""}`
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

/**
 * Build embed for release event.
 */
export function buildReleaseEmbed(payload: GitHubReleasePayload): MessageEmbed {
	const release = payload.release
	const repository = payload.repository
	const sender = payload.sender

	return {
		title: `${release.name || release.tag_name}`,
		description: release.body
			? `${release.body.slice(0, 300)}${release.body.length > 300 ? "..." : ""}`
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

/**
 * Build embed for deployment status event.
 */
export function buildDeploymentEmbed(payload: GitHubDeploymentStatusPayload): MessageEmbed {
	const deploymentStatus = payload.deployment_status
	const deployment = payload.deployment
	const repository = payload.repository
	const sender = payload.sender

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
		description: deploymentStatus.description ?? undefined,
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

/**
 * Build embed for workflow run event.
 */
export function buildWorkflowRunEmbed(payload: GitHubWorkflowRunPayload): MessageEmbed {
	const workflowRun = payload.workflow_run
	const repository = payload.repository
	const sender = payload.sender

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
			...(workflowRun.head_branch
				? [
						{
							name: "Branch",
							value: workflowRun.head_branch,
							inline: true,
						},
					]
				: []),
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

/**
 * Map GitHub event type to our internal event type.
 */
export function mapEventType(githubEventType: string): GitHubEventType | null {
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

/**
 * Check if a push event matches the branch filter.
 */
export function matchesBranchFilter(branchFilter: string | null, ref: string | undefined): boolean {
	if (!branchFilter) return true // No filter = all branches
	if (!ref) return true

	const branch = ref.replace("refs/heads/", "")
	return branch === branchFilter
}

/**
 * Build embed for the GitHub event based on event type.
 * Returns null if the event type is not supported.
 */
export function buildGitHubEmbed(eventType: string, payload: unknown): MessageEmbed | null {
	switch (eventType) {
		case "push":
			return buildPushEmbed(payload as GitHubPushPayload)
		case "pull_request":
			return buildPullRequestEmbed(payload as GitHubPullRequestPayload)
		case "issues":
			return buildIssueEmbed(payload as GitHubIssuesPayload)
		case "release":
			return buildReleaseEmbed(payload as GitHubReleasePayload)
		case "deployment_status":
			return buildDeploymentEmbed(payload as GitHubDeploymentStatusPayload)
		case "workflow_run":
			return buildWorkflowRunEmbed(payload as GitHubWorkflowRunPayload)
		default:
			return null
	}
}
