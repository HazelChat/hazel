import { Rpc, RpcGroup } from "effect/unstable/rpc"
import {
	ChannelId,
	ExternalChannelId,
	IntegrationConnectionId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	TransactionId,
} from "@hazel/schema"
import { Schema } from "effect"
import { InternalServerError, UnauthorizedError } from "../errors"
import { ChatSyncChannelLink, ChatSyncConnection } from "../models"
import { AuthMiddleware } from "./middleware"
import { RequiredScopes } from "../scopes/required-scopes"

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

export class ChatSyncConnectionNotFoundError extends Schema.TaggedErrorClass<ChatSyncConnectionNotFoundError>()(
	"ChatSyncConnectionNotFoundError",
	{
		syncConnectionId: SyncConnectionId,
	},
) {}

export class ChatSyncChannelLinkNotFoundError extends Schema.TaggedErrorClass<ChatSyncChannelLinkNotFoundError>()(
	"ChatSyncChannelLinkNotFoundError",
	{
		syncChannelLinkId: SyncChannelLinkId,
	},
) {}

export class ChatSyncConnectionExistsError extends Schema.TaggedErrorClass<ChatSyncConnectionExistsError>()(
	"ChatSyncConnectionExistsError",
	{
		organizationId: OrganizationId,
		provider: Schema.String,
		externalWorkspaceId: Schema.String,
	},
) {}

export class ChatSyncIntegrationNotConnectedError extends Schema.TaggedErrorClass<ChatSyncIntegrationNotConnectedError>()(
	"ChatSyncIntegrationNotConnectedError",
	{
		organizationId: OrganizationId,
		provider: Schema.String,
	},
) {}

export class ChatSyncChannelLinkExistsError extends Schema.TaggedErrorClass<ChatSyncChannelLinkExistsError>()(
	"ChatSyncChannelLinkExistsError",
	{
		syncConnectionId: SyncConnectionId,
		hazelChannelId: ChannelId,
		externalChannelId: ExternalChannelId,
	},
) {}

export class ChatSyncRpcs extends RpcGroup.make(
	Rpc.make("chatSync.connection.create", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
			provider: ChatSyncConnection.ChatSyncProvider,
			externalWorkspaceId: Schema.String,
			externalWorkspaceName: Schema.optional(Schema.String),
			integrationConnectionId: Schema.optional(IntegrationConnectionId),
			settings: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
			metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
		}),
		success: ChatSyncConnectionResponse,
		error: Schema.Union([
			ChatSyncConnectionExistsError,
			ChatSyncIntegrationNotConnectedError,
			UnauthorizedError,
			InternalServerError,
		]),
	})
		.annotate(RequiredScopes, ["integration-connections:write"])
		.middleware(AuthMiddleware),

	Rpc.make("chatSync.connection.list", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
		}),
		success: ChatSyncConnectionListResponse,
		error: Schema.Union([UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["integration-connections:read"])
		.middleware(AuthMiddleware),

	Rpc.make("chatSync.connection.delete", {
		payload: Schema.Struct({
			syncConnectionId: SyncConnectionId,
		}),
		success: Schema.Struct({
			transactionId: TransactionId,
		}),
		error: Schema.Union([ChatSyncConnectionNotFoundError, UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["integration-connections:write"])
		.middleware(AuthMiddleware),

	Rpc.make("chatSync.channelLink.create", {
		payload: Schema.Struct({
			syncConnectionId: SyncConnectionId,
			hazelChannelId: ChannelId,
			externalChannelId: ExternalChannelId,
			externalChannelName: Schema.optional(Schema.String),
			direction: Schema.optional(ChatSyncChannelLink.ChatSyncDirection),
			settings: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
		}),
		success: ChatSyncChannelLinkResponse,
		error: Schema.Union([
			ChatSyncConnectionNotFoundError,
			ChatSyncChannelLinkExistsError,
			UnauthorizedError,
			InternalServerError,
		]),
	})
		.annotate(RequiredScopes, ["integration-connections:write"])
		.middleware(AuthMiddleware),

	Rpc.make("chatSync.channelLink.list", {
		payload: Schema.Struct({
			syncConnectionId: SyncConnectionId,
		}),
		success: ChatSyncChannelLinkListResponse,
		error: Schema.Union([ChatSyncConnectionNotFoundError, UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["integration-connections:read"])
		.middleware(AuthMiddleware),

	Rpc.make("chatSync.channelLink.delete", {
		payload: Schema.Struct({
			syncChannelLinkId: SyncChannelLinkId,
		}),
		success: Schema.Struct({
			transactionId: TransactionId,
		}),
		error: Schema.Union([ChatSyncChannelLinkNotFoundError, UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["integration-connections:write"])
		.middleware(AuthMiddleware),

	Rpc.make("chatSync.channelLink.update", {
		payload: Schema.Struct({
			syncChannelLinkId: SyncChannelLinkId,
			direction: Schema.optional(ChatSyncChannelLink.ChatSyncDirection),
			isActive: Schema.optional(Schema.Boolean),
		}),
		success: ChatSyncChannelLinkResponse,
		error: Schema.Union([ChatSyncChannelLinkNotFoundError, UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["integration-connections:write"])
		.middleware(AuthMiddleware),
) {}
