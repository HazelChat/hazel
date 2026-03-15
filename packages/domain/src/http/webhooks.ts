import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect/unstable/httpapi"
import { Schema } from "effect"
import { InternalServerError, WorkflowInitializationError } from "../errors"
import { RequiredScopes } from "../scopes/required-scopes"

// WorkOS Webhook Types
export class WorkOSWebhookPayload extends Schema.Class<WorkOSWebhookPayload>("WorkOSWebhookPayload")({
	event: Schema.String,
	data: Schema.Unknown,
	id: Schema.String,
	created_at: Schema.String,
}) {}

export class WebhookResponse extends Schema.Class<WebhookResponse>("WebhookResponse")({
	success: Schema.Boolean,
	message: Schema.optional(Schema.String),
}) {}

export class InvalidWebhookSignature extends Schema.TaggedErrorClass<InvalidWebhookSignature>(
	"InvalidWebhookSignature",
)(
	"InvalidWebhookSignature",
	{
		message: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

// GitHub Webhook Types
export class GitHubWebhookResponse extends Schema.Class<GitHubWebhookResponse>("GitHubWebhookResponse")({
	processed: Schema.Boolean,
	messagesCreated: Schema.optional(Schema.Number),
}) {}

export class InvalidGitHubWebhookSignature extends Schema.TaggedErrorClass<InvalidGitHubWebhookSignature>(
	"InvalidGitHubWebhookSignature",
)(
	"InvalidGitHubWebhookSignature",
	{
		message: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

export class WebhookGroup extends HttpApiGroup.make("webhooks")
	.add(
		HttpApiEndpoint.post("workos")`/workos`
			.setPayload(Schema.Unknown)
			.addSuccess(WebhookResponse)
			.addError(InvalidWebhookSignature)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "WorkOS Webhook",
					description: "Receive and process WorkOS webhook events",
					summary: "Process WorkOS webhook events",
				}),
			)
			.annotate(RequiredScopes, []),
	)
	.add(
		HttpApiEndpoint.post("github")`/github`
			.setPayload(Schema.Unknown)
			.addSuccess(GitHubWebhookResponse)
			.addError(InvalidGitHubWebhookSignature)
			.addError(InternalServerError)
			.addError(WorkflowInitializationError)
			.annotateContext(
				OpenApi.annotations({
					title: "GitHub App Webhook",
					description: "Receive and process GitHub App webhook events",
					summary: "Process GitHub App webhook events",
				}),
			)
			.annotate(RequiredScopes, []),
	)
	.prefix("/webhooks") {}
