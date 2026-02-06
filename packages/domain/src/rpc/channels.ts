import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import {
	AIProviderUnavailableError,
	AIRateLimitError,
	AIResponseParseError,
	DmChannelAlreadyExistsError,
	InternalServerError,
	MessageNotFoundError,
	NestedThreadError,
	OriginalMessageNotFoundError,
	ThreadChannelNotFoundError,
	ThreadContextQueryError,
	ThreadNameUpdateError,
	UnauthorizedError,
	WorkflowServiceUnavailableError,
} from "../errors"

export { NestedThreadError } from "../errors"
import { ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import { Channel } from "../models"
import { TransactionId } from "@hazel/schema"
import { AuthMiddleware } from "./middleware"

/**
 * Response schema for successful channel operations.
 * Contains the channel data and a transaction ID for optimistic updates.
 */
export class ChannelResponse extends Schema.Class<ChannelResponse>("ChannelResponse")({
	data: Channel.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Error thrown when a channel is not found.
 * Used in update and delete operations.
 */
export class ChannelNotFoundError extends Schema.TaggedError<ChannelNotFoundError>()("ChannelNotFoundError", {
	channelId: ChannelId,
}) {}

/**
 * Request schema for creating DM or group channels.
 * Specifies participants and channel type.
 */
export class CreateDmChannelRequest extends Schema.Class<CreateDmChannelRequest>("CreateDmChannelRequest")({
	participantIds: Schema.Array(UserId),
	type: Schema.Literal("direct", "single"),
	name: Schema.optional(Schema.String),
	organizationId: Schema.UUID,
}) {}

/**
 * Request schema for ensuring a thread channel exists for a message.
 * If a thread already exists, it is returned as-is.
 * If no thread exists, it is created, the creator is added as a member,
 * and the message is linked to the thread.
 */
export class CreateThreadRequest extends Schema.Class<CreateThreadRequest>("CreateThreadRequest")({
	id: Schema.optional(ChannelId),
	messageId: MessageId,
	organizationId: Schema.optional(OrganizationId),
}) {}

/**
 * Request schema for creating channels.
 * Uses jsonCreate which includes optional id for optimistic updates.
 * Extended with addAllMembers option to auto-add all organization members.
 */
export const CreateChannelRequest = Schema.extend(
	Channel.Model.jsonCreate,
	Schema.Struct({
		addAllMembers: Schema.optional(Schema.Boolean),
	}),
)

export class ChannelRpcs extends RpcGroup.make(
	/**
	 * ChannelCreate
	 *
	 * Creates a new channel in an organization.
	 * The current user is automatically added as a member of the channel.
	 * Requires permission to create channels in the organization.
	 *
	 * @param payload - Channel data (name, type, organizationId, etc.) with optional id for optimistic updates
	 * @returns Channel data and transaction ID
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channel.create", {
		payload: CreateChannelRequest,
		success: ChannelResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelUpdate
	 *
	 * Updates an existing channel.
	 * Only users with appropriate permissions can update a channel.
	 *
	 * @param payload - Channel ID and fields to update
	 * @returns Updated channel data and transaction ID
	 * @throws ChannelNotFoundError if channel doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channel.update", {
		payload: Schema.Struct({
			id: ChannelId,
		}).pipe(Schema.extend(Schema.partial(Channel.Model.jsonUpdate))),
		success: ChannelResponse,
		error: Schema.Union(ChannelNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelDelete
	 *
	 * Deletes a channel (soft delete).
	 * Only users with appropriate permissions can delete a channel.
	 *
	 * @param payload - Channel ID to delete
	 * @returns Transaction ID
	 * @throws ChannelNotFoundError if channel doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channel.delete", {
		payload: Schema.Struct({ id: ChannelId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(ChannelNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelCreateDm
	 *
	 * Creates a direct message or group channel with specified participants.
	 * For single DMs, automatically checks if a DM already exists between users.
	 * All participants are automatically added as channel members.
	 *
	 * @param payload - Participant IDs, channel type, and organization ID
	 * @returns Channel data and transaction ID
	 * @throws DmChannelAlreadyExistsError if DM already exists (for single type)
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channel.createDm", {
		payload: CreateDmChannelRequest,
		success: ChannelResponse,
		error: Schema.Union(DmChannelAlreadyExistsError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelCreateThread
	 *
	 * Ensures a thread channel exists for a message and returns it.
	 * If a thread already exists, it is returned.
	 * Otherwise this atomically creates the thread channel, adds the creator
	 * as a member, and links the original message to the thread.
	 *
	 * @param payload - Message ID, optional organization ID, and optional channel ID for optimistic updates
	 * @returns Channel data and transaction ID
	 * @throws MessageNotFoundError if the message doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channel.createThread", {
		payload: CreateThreadRequest,
		success: ChannelResponse,
		error: Schema.Union(MessageNotFoundError, NestedThreadError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelGenerateName
	 *
	 * Generates an AI-powered name for a thread channel.
	 * Uses the ThreadNamingWorkflow to analyze the thread conversation and generate
	 * a descriptive 3-6 word name.
	 *
	 * @param payload - Thread channel ID
	 * @returns Transaction ID
	 * @throws ChannelNotFoundError if channel doesn't exist or is not a thread
	 * @throws MessageNotFoundError if original message is not found
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 * @throws ThreadChannelNotFoundError if thread channel not found in workflow
	 * @throws OriginalMessageNotFoundError if original message not found in workflow
	 * @throws ThreadContextQueryError if database query fails in workflow
	 * @throws AIProviderUnavailableError if AI service is unreachable
	 * @throws AIRateLimitError if AI service rate limits the request
	 * @throws AIResponseParseError if AI response cannot be parsed
	 * @throws ThreadNameUpdateError if database update fails in workflow
	 */
	Rpc.mutation("channel.generateName", {
		payload: Schema.Struct({ channelId: ChannelId }),
		success: Schema.Struct({ success: Schema.Boolean }),
		error: Schema.Union(
			ChannelNotFoundError,
			MessageNotFoundError,
			UnauthorizedError,
			InternalServerError,
			WorkflowServiceUnavailableError,
			// Workflow errors - exposed to client for granular error handling
			ThreadChannelNotFoundError,
			OriginalMessageNotFoundError,
			ThreadContextQueryError,
			AIProviderUnavailableError,
			AIRateLimitError,
			AIResponseParseError,
			ThreadNameUpdateError,
		),
	}).middleware(AuthMiddleware),
) {}
