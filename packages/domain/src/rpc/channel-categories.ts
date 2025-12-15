import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { ChannelCategoryId, OrganizationId } from "../ids"
import { ChannelCategory } from "../models"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"

/**
 * Response schema for successful channel category operations.
 * Contains the category data and a transaction ID for optimistic updates.
 */
export class ChannelCategoryResponse extends Schema.Class<ChannelCategoryResponse>("ChannelCategoryResponse")({
	data: ChannelCategory.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Error thrown when a channel category is not found.
 */
export class ChannelCategoryNotFoundError extends Schema.TaggedError<ChannelCategoryNotFoundError>()(
	"ChannelCategoryNotFoundError",
	{
		categoryId: ChannelCategoryId,
	},
) {}

/**
 * Request schema for creating channel categories.
 * Extends jsonCreate but allows optional id for optimistic updates.
 */
export const CreateChannelCategoryRequest = Schema.Struct({
	id: Schema.optional(ChannelCategoryId),
	...ChannelCategory.Model.jsonCreate.fields,
})

export class ChannelCategoryRpcs extends RpcGroup.make(
	/**
	 * ChannelCategoryCreate
	 *
	 * Creates a new channel category in an organization.
	 * Requires permission to manage the organization.
	 *
	 * @param payload - Category data (name, organizationId, sortOrder) with optional id for optimistic updates
	 * @returns Category data and transaction ID
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channelCategory.create", {
		payload: CreateChannelCategoryRequest,
		success: ChannelCategoryResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelCategoryUpdate
	 *
	 * Updates an existing channel category.
	 * Only users with appropriate permissions can update a category.
	 *
	 * @param payload - Category ID and fields to update (name, sortOrder)
	 * @returns Updated category data and transaction ID
	 * @throws ChannelCategoryNotFoundError if category doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channelCategory.update", {
		payload: Schema.Struct({
			id: ChannelCategoryId,
		}).pipe(Schema.extend(Schema.partial(ChannelCategory.Model.jsonUpdate))),
		success: ChannelCategoryResponse,
		error: Schema.Union(ChannelCategoryNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelCategoryDelete
	 *
	 * Deletes a channel category (soft delete).
	 * Channels in this category will become uncategorized.
	 * Only users with appropriate permissions can delete a category.
	 *
	 * @param payload - Category ID to delete
	 * @returns Transaction ID
	 * @throws ChannelCategoryNotFoundError if category doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("channelCategory.delete", {
		payload: Schema.Struct({ id: ChannelCategoryId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(ChannelCategoryNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ChannelCategoryList
	 *
	 * Lists all channel categories for an organization.
	 *
	 * @param payload - Organization ID
	 * @returns Array of categories
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("channelCategory.list", {
		payload: Schema.Struct({ organizationId: OrganizationId }),
		success: Schema.Struct({
			categories: Schema.Array(ChannelCategory.Model.json),
		}),
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
