// Re-export GitHub payloads from @hazel/integrations for backwards compatibility
// Using schema import to avoid Node.js-only code
export {
	GitHubCommit,
	GitHubDeployment,
	GitHubDeploymentStatus,
	GitHubDeploymentStatusPayload,
	GitHubIssue,
	GitHubIssuesPayload,
	GitHubLabel,
	GitHubPullRequest,
	GitHubPullRequestPayload,
	GitHubPushPayload,
	GitHubRelease,
	GitHubReleasePayload,
	GitHubRepository,
	GitHubUser,
	type GitHubWebhookPayload,
	GitHubWorkflowRun,
	GitHubWorkflowRunPayload,
} from "@hazel/integrations/github/schema"
export * from "./cleanup-activities.ts"
export * from "./github-activities.ts"
export * from "./message-activities.ts"
