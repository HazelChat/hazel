import { RpcGroup } from "@effect/rpc"
import {
	ChannelId,
	IntegrationConnectionId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	TransactionId,
} from "@hazel/schema"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { ChatSyncChannelLink, ChatSyncConnection } from "../models"
import { AuthMiddleware } from "./middleware"

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

export class ChatSyncRpcs extends RpcGroup.make(
	Rpc.mutation("chatSync.connection.create", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
			provider: ChatSyncConnection.ChatSyncProvider,
			externalWorkspaceId: Schema.String,
			externalWorkspaceName: Schema.optional(Schema.String),
			integrationConnectionId: Schema.optional(IntegrationConnectionId),
			settings: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
			metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
		}),
		success: ChatSyncConnectionResponse,
		error: Schema.Union(
			ChatSyncConnectionExistsError,
			ChatSyncIntegrationNotConnectedError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	Rpc.query("chatSync.connection.list", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
		}),
		success: ChatSyncConnectionListResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.mutation("chatSync.connection.delete", {
		payload: Schema.Struct({
			syncConnectionId: SyncConnectionId,
		}),
		success: Schema.Struct({
			transactionId: TransactionId,
		}),
		error: Schema.Union(ChatSyncConnectionNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.mutation("chatSync.channelLink.create", {
		payload: Schema.Struct({
			syncConnectionId: SyncConnectionId,
			hazelChannelId: ChannelId,
			externalChannelId: Schema.String,
			externalChannelName: Schema.optional(Schema.String),
			direction: Schema.optional(ChatSyncChannelLink.ChatSyncDirection),
			settings: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
		}),
		success: ChatSyncChannelLinkResponse,
		error: Schema.Union(
			ChatSyncConnectionNotFoundError,
			ChatSyncChannelLinkExistsError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	Rpc.query("chatSync.channelLink.list", {
		payload: Schema.Struct({
			syncConnectionId: SyncConnectionId,
		}),
		success: ChatSyncChannelLinkListResponse,
		error: Schema.Union(ChatSyncConnectionNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.mutation("chatSync.channelLink.delete", {
		payload: Schema.Struct({
			syncChannelLinkId: SyncChannelLinkId,
		}),
		success: Schema.Struct({
			transactionId: TransactionId,
		}),
		error: Schema.Union(ChatSyncChannelLinkNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.mutation("chatSync.channelLink.update", {
		payload: Schema.Struct({
			syncChannelLinkId: SyncChannelLinkId,
			direction: Schema.optional(ChatSyncChannelLink.ChatSyncDirection),
			isActive: Schema.optional(Schema.Boolean),
		}),
		success: ChatSyncChannelLinkResponse,
		error: Schema.Union(ChatSyncChannelLinkNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
