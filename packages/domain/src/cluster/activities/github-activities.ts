import { ChannelId, GitHubSubscriptionId, MessageId } from "@hazel/schema"
import { Schema } from "effect"
import { GitHubSubscription } from "../../models"

// Re-export GitHubEventType for use in workflow handlers
export { GitHubEventType, GitHubEventTypes } from "../../models/github-subscription-model"

// Subscription data needed for workflow processing
export const GitHubSubscriptionForWorkflow = Schema.Struct({
	id: GitHubSubscriptionId,
	channelId: ChannelId,
	enabledEvents: GitHubSubscription.GitHubEventTypes,
	branchFilter: Schema.NullOr(Schema.String),
})

export type GitHubSubscriptionForWorkflow = Schema.Schema.Type<typeof GitHubSubscriptionForWorkflow>

// Result of getting GitHub subscriptions for a repository
export const GetGitHubSubscriptionsResult = Schema.Struct({
	subscriptions: Schema.Array(GitHubSubscriptionForWorkflow),
	totalCount: Schema.Number,
})

export type GetGitHubSubscriptionsResult = Schema.Schema.Type<typeof GetGitHubSubscriptionsResult>

// Result of creating messages in subscribed channels
export const CreateGitHubMessagesResult = Schema.Struct({
	messageIds: Schema.Array(MessageId),
	messagesCreated: Schema.Number,
})

export type CreateGitHubMessagesResult = Schema.Schema.Type<typeof CreateGitHubMessagesResult>

// Error types for GitHub activities
export class GetGitHubSubscriptionsError extends Schema.TaggedError<GetGitHubSubscriptionsError>()(
	"GetGitHubSubscriptionsError",
	{
		repositoryId: Schema.Number,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {}

export class CreateGitHubMessageError extends Schema.TaggedError<CreateGitHubMessageError>()(
	"CreateGitHubMessageError",
	{
		channelId: ChannelId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {}
