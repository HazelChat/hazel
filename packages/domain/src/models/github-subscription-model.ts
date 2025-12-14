import { ChannelId, GitHubSubscriptionId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

// GitHub event types that can be subscribed to
export const GitHubEventType = Schema.Literal(
	"push",
	"pull_request",
	"issues",
	"release",
	"deployment_status",
	"workflow_run",
)
export type GitHubEventType = Schema.Schema.Type<typeof GitHubEventType>

export const GitHubEventTypes = Schema.Array(GitHubEventType)
export type GitHubEventTypes = Schema.Schema.Type<typeof GitHubEventTypes>

export class Model extends M.Class<Model>("GitHubSubscription")({
	id: M.Generated(GitHubSubscriptionId),
	channelId: ChannelId,
	organizationId: OrganizationId,
	// Repository identification - GitHub's numeric ID is stable across renames
	repositoryId: Schema.Number,
	repositoryFullName: Schema.String, // "owner/repo" for display
	repositoryOwner: Schema.String,
	repositoryName: Schema.String,
	// Event type filters
	enabledEvents: GitHubEventTypes,
	// Optional branch filter for push events (null = all branches)
	branchFilter: Schema.NullOr(Schema.String),
	// Whether the subscription is active
	isEnabled: Schema.Boolean,
	// Audit fields
	createdBy: UserId,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update
