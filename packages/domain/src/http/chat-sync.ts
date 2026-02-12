import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import {
	ChannelId,
	IntegrationConnectionId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	TransactionId,
} from "@hazel/schema"
import { Schema } from "effect"
import * as CurrentUser from "../current-user"
import { InternalServerError, UnauthorizedError } from "../errors"
import { ChatSyncChannelLink, ChatSyncConnection } from "../models"

export class ChatSyncConnectionResponse extends Schema.Class<ChatSyncConnectionResponse>(
	"ChatSyncConnectionResponse",
)({
	data: ChatSyncConnection.Model.json,
	transactionId: TransactionId,
}) {}

export class ChatSyncConnectionListResponse extends Schema.Class<ChatSyncConnectionListResponse>(
	"ChatSyncConnectionListResponse",
)({
	data: Schema.Array(ChatSyncConnection.Model.json),
}) {}

export class ChatSyncChannelLinkResponse extends Schema.Class<ChatSyncChannelLinkResponse>(
	"ChatSyncChannelLinkResponse",
)({
	data: ChatSyncChannelLink.Model.json,
	transactionId: TransactionId,
}) {}

export class ChatSyncChannelLinkListResponse extends Schema.Class<ChatSyncChannelLinkListResponse>(
	"ChatSyncChannelLinkListResponse",
)({
	data: Schema.Array(ChatSyncChannelLink.Model.json),
}) {}

export class ChatSyncDeleteResponse extends Schema.Class<ChatSyncDeleteResponse>("ChatSyncDeleteResponse")({
	transactionId: TransactionId,
}) {}

export class ChatSyncConnectionNotFoundError extends Schema.TaggedError<ChatSyncConnectionNotFoundError>()(
	"ChatSyncConnectionNotFoundError",
	{
		syncConnectionId: SyncConnectionId,
	},
) {}

export class ChatSyncChannelLinkNotFoundError extends Schema.TaggedError<ChatSyncChannelLinkNotFoundError>()(
	"ChatSyncChannelLinkNotFoundError",
	{
		syncChannelLinkId: SyncChannelLinkId,
	},
) {}

export class ChatSyncConnectionExistsError extends Schema.TaggedError<ChatSyncConnectionExistsError>()(
	"ChatSyncConnectionExistsError",
	{
		organizationId: OrganizationId,
		provider: Schema.String,
		externalWorkspaceId: Schema.String,
	},
) {}

export class ChatSyncIntegrationNotConnectedError extends Schema.TaggedError<ChatSyncIntegrationNotConnectedError>()(
	"ChatSyncIntegrationNotConnectedError",
	{
		organizationId: OrganizationId,
		provider: Schema.String,
	},
) {}

export class ChatSyncChannelLinkExistsError extends Schema.TaggedError<ChatSyncChannelLinkExistsError>()(
	"ChatSyncChannelLinkExistsError",
	{
		syncConnectionId: SyncConnectionId,
		hazelChannelId: ChannelId,
		externalChannelId: Schema.String,
	},
) {}

export class CreateChatSyncConnectionRequest extends Schema.Class<CreateChatSyncConnectionRequest>(
	"CreateChatSyncConnectionRequest",
)({
	provider: ChatSyncConnection.ChatSyncProvider,
	externalWorkspaceId: Schema.String,
	externalWorkspaceName: Schema.NullishOr(Schema.String),
	integrationConnectionId: Schema.NullishOr(IntegrationConnectionId),
	settings: Schema.NullishOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	metadata: Schema.NullishOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
}) {}

export class CreateChatSyncChannelLinkRequest extends Schema.Class<CreateChatSyncChannelLinkRequest>(
	"CreateChatSyncChannelLinkRequest",
)({
	hazelChannelId: ChannelId,
	externalChannelId: Schema.String,
	externalChannelName: Schema.NullishOr(Schema.String),
	direction: Schema.optional(ChatSyncChannelLink.ChatSyncDirection),
	settings: Schema.NullishOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
}) {}

export class ChatSyncGroup extends HttpApiGroup.make("chat-sync")
	.add(
		HttpApiEndpoint.post("createConnection", `/:orgId/connections`)
			.setPath(Schema.Struct({ orgId: OrganizationId }))
			.setPayload(CreateChatSyncConnectionRequest)
			.addSuccess(ChatSyncConnectionResponse)
			.addError(ChatSyncConnectionExistsError)
			.addError(ChatSyncIntegrationNotConnectedError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create Chat Sync Connection",
					description: "Create a provider-agnostic chat sync connection (Discord, Slack, etc.)",
					summary: "Create sync connection",
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("listConnections", `/:orgId/connections`)
			.setPath(Schema.Struct({ orgId: OrganizationId }))
			.addSuccess(ChatSyncConnectionListResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "List Chat Sync Connections",
					description: "List chat sync connections for an organization",
					summary: "List sync connections",
				}),
			),
	)
	.add(
		HttpApiEndpoint.del("deleteConnection", `/connections/:syncConnectionId`)
			.setPath(Schema.Struct({ syncConnectionId: SyncConnectionId }))
			.addSuccess(ChatSyncDeleteResponse)
			.addError(ChatSyncConnectionNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Delete Chat Sync Connection",
					description: "Soft-delete a chat sync connection",
					summary: "Delete sync connection",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("createChannelLink", `/connections/:syncConnectionId/channel-links`)
			.setPath(Schema.Struct({ syncConnectionId: SyncConnectionId }))
			.setPayload(CreateChatSyncChannelLinkRequest)
			.addSuccess(ChatSyncChannelLinkResponse)
			.addError(ChatSyncConnectionNotFoundError)
			.addError(ChatSyncChannelLinkExistsError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create Chat Sync Channel Link",
					description: "Link a Hazel channel to an external provider channel",
					summary: "Create channel link",
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("listChannelLinks", `/connections/:syncConnectionId/channel-links`)
			.setPath(Schema.Struct({ syncConnectionId: SyncConnectionId }))
			.addSuccess(ChatSyncChannelLinkListResponse)
			.addError(ChatSyncConnectionNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "List Chat Sync Channel Links",
					description: "List channel links for a sync connection",
					summary: "List channel links",
				}),
			),
	)
	.add(
		HttpApiEndpoint.del("deleteChannelLink", `/channel-links/:syncChannelLinkId`)
			.setPath(Schema.Struct({ syncChannelLinkId: SyncChannelLinkId }))
			.addSuccess(ChatSyncDeleteResponse)
			.addError(ChatSyncChannelLinkNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Delete Chat Sync Channel Link",
					description: "Soft-delete a chat sync channel link",
					summary: "Delete channel link",
				}),
			),
	)
	.prefix("/chat-sync")
	.middleware(CurrentUser.Authorization) {}
