import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import * as CurrentUser from "../current-user"
import { InternalServerError, UnauthorizedError } from "../errors"
import { OrganizationId } from "../ids"
import { IntegrationConnection } from "../models"

// Provider type from the model
const IntegrationProvider = IntegrationConnection.IntegrationProvider

// Linear issue state schema
const LinearIssueStateResponse = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	color: Schema.String,
})

// Linear issue assignee schema
const LinearIssueAssigneeResponse = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
})

// Linear issue label schema
const LinearIssueLabelResponse = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	color: Schema.String,
})

// Full Linear issue response
export class LinearIssueResourceResponse extends Schema.Class<LinearIssueResourceResponse>(
	"LinearIssueResourceResponse",
)({
	id: Schema.String,
	identifier: Schema.String,
	title: Schema.String,
	description: Schema.NullOr(Schema.String),
	url: Schema.String,
	teamName: Schema.String,
	state: Schema.NullOr(LinearIssueStateResponse),
	assignee: Schema.NullOr(LinearIssueAssigneeResponse),
	priority: Schema.Number,
	priorityLabel: Schema.String,
	labels: Schema.Array(LinearIssueLabelResponse),
}) {}

// GitHub PR author schema
const GitHubPRAuthorResponse = Schema.Struct({
	login: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
})

// GitHub PR label schema
const GitHubPRLabelResponse = Schema.Struct({
	name: Schema.String,
	color: Schema.String,
})

// Full GitHub PR response
export class GitHubPRResourceResponse extends Schema.Class<GitHubPRResourceResponse>(
	"GitHubPRResourceResponse",
)({
	owner: Schema.String,
	repo: Schema.String,
	number: Schema.Number,
	title: Schema.String,
	body: Schema.NullOr(Schema.String),
	state: Schema.Literal("open", "closed"),
	draft: Schema.Boolean,
	merged: Schema.Boolean,
	author: Schema.NullOr(GitHubPRAuthorResponse),
	additions: Schema.Number,
	deletions: Schema.Number,
	headRefName: Schema.String,
	updatedAt: Schema.String,
	labels: Schema.Array(GitHubPRLabelResponse),
}) {}

// Error when organization doesn't have the integration connected
export class IntegrationNotConnectedForPreviewError extends Schema.TaggedError<IntegrationNotConnectedForPreviewError>()(
	"IntegrationNotConnectedForPreviewError",
	{
		provider: IntegrationProvider,
	},
) {}

// Error when resource cannot be found
export class ResourceNotFoundError extends Schema.TaggedError<ResourceNotFoundError>()(
	"ResourceNotFoundError",
	{
		url: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

// Error when integration API returns an error (authorization, rate limit, etc.)
export class IntegrationResourceError extends Schema.TaggedError<IntegrationResourceError>()(
	"IntegrationResourceError",
	{
		url: Schema.String,
		message: Schema.String,
		provider: IntegrationProvider,
	},
) {}

// API Group for integration resources
export class IntegrationResourceGroup extends HttpApiGroup.make("integration-resources")
	.add(
		HttpApiEndpoint.get("fetchLinearIssue", `/:orgId/linear/issue`)
			.addSuccess(LinearIssueResourceResponse)
			.addError(IntegrationNotConnectedForPreviewError)
			.addError(IntegrationResourceError)
			.addError(ResourceNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
				}),
			)
			.setUrlParams(
				Schema.Struct({
					url: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Fetch Linear Issue",
					description: "Fetch Linear issue details for embedding in chat messages",
					summary: "Get Linear issue preview data",
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("fetchGitHubPR", `/:orgId/github/pr`)
			.addSuccess(GitHubPRResourceResponse)
			.addError(IntegrationNotConnectedForPreviewError)
			.addError(IntegrationResourceError)
			.addError(ResourceNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
				}),
			)
			.setUrlParams(
				Schema.Struct({
					url: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Fetch GitHub PR",
					description: "Fetch GitHub pull request details for embedding in chat messages",
					summary: "Get GitHub PR preview data",
				}),
			),
	)
	.prefix("/integrations/resources")
	.middleware(CurrentUser.Authorization) {}
