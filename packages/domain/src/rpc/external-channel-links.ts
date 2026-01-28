import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { ChannelId, ExternalChannelLinkId, OrganizationId } from "../ids"
import { ExternalChannelLink, IntegrationConnection } from "../models"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"
import { ChannelNotFoundError } from "./channels"

/**
 * Response schema for successful external channel link operations.
 */
export class ExternalChannelLinkResponse extends Schema.Class<ExternalChannelLinkResponse>(
	"ExternalChannelLinkResponse",
)({
	data: ExternalChannelLink.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Response schema for listing external channel links.
 */
export class ExternalChannelLinksListResponse extends Schema.Class<ExternalChannelLinksListResponse>(
	"ExternalChannelLinksListResponse",
)({
	data: Schema.Array(ExternalChannelLink.Model.json),
}) {}

/**
 * Error thrown when an external channel link is not found.
 */
export class ExternalChannelLinkNotFoundError extends Schema.TaggedError<ExternalChannelLinkNotFoundError>()(
	"ExternalChannelLinkNotFoundError",
	{
		id: ExternalChannelLinkId,
	},
) {}

/**
 * Error thrown when a link already exists between the same Hazel channel and external channel.
 */
export class ExternalLinkAlreadyExistsError extends Schema.TaggedError<ExternalLinkAlreadyExistsError>()(
	"ExternalLinkAlreadyExistsError",
	{
		channelId: ChannelId,
		provider: IntegrationConnection.IntegrationProvider,
		externalChannelId: Schema.String,
	},
) {}

/**
 * Request schema for creating an external channel link.
 */
export const CreateExternalChannelLinkRequest = Schema.Struct({
	channelId: ChannelId,
	organizationId: OrganizationId,
	provider: IntegrationConnection.IntegrationProvider,
	externalWorkspaceId: Schema.String,
	externalWorkspaceName: Schema.String,
	externalChannelId: Schema.String,
	externalChannelName: Schema.String,
	syncDirection: ExternalChannelLink.SyncDirection,
	config: Schema.NullOr(ExternalChannelLink.ExternalChannelConfig),
	isEnabled: Schema.Boolean,
})

/**
 * Request schema for updating an external channel link.
 */
export const UpdateExternalChannelLinkRequest = Schema.Struct({
	id: ExternalChannelLinkId,
}).pipe(
	Schema.extend(
		Schema.partial(
			Schema.Struct({
				syncDirection: ExternalChannelLink.SyncDirection,
				config: ExternalChannelLink.ExternalChannelConfig,
				isEnabled: Schema.Boolean,
			}),
		),
	),
)

export class ExternalChannelLinkRpcs extends RpcGroup.make(
	/**
	 * List all external channel links for a channel.
	 */
	Rpc.query("externalChannelLink.list", {
		payload: Schema.Struct({
			channelId: ChannelId,
		}),
		success: ExternalChannelLinksListResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * List all external channel links for an organization.
	 */
	Rpc.query("externalChannelLink.listByOrg", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
		}),
		success: ExternalChannelLinksListResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * Create a new external channel link.
	 */
	Rpc.mutation("externalChannelLink.create", {
		payload: CreateExternalChannelLinkRequest,
		success: ExternalChannelLinkResponse,
		error: Schema.Union(
			ChannelNotFoundError,
			ExternalLinkAlreadyExistsError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * Update an external channel link.
	 */
	Rpc.mutation("externalChannelLink.update", {
		payload: UpdateExternalChannelLinkRequest,
		success: ExternalChannelLinkResponse,
		error: Schema.Union(ExternalChannelLinkNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * Delete an external channel link.
	 */
	Rpc.mutation("externalChannelLink.delete", {
		payload: Schema.Struct({ id: ExternalChannelLinkId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(ExternalChannelLinkNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
