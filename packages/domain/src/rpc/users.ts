import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import * as CurrentUser from "../current-user"
import { InternalServerError, UnauthorizedError } from "../errors"
import { UserId } from "../ids"
import { User } from "../models"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"

/**
 * Response schema for successful user operations.
 * Contains the user data and a transaction ID for optimistic updates.
 */
export class UserResponse extends Schema.Class<UserResponse>("UserResponse")({
	data: User.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Error thrown when a user is not found.
 * Used in update and delete operations.
 */
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()("UserNotFoundError", {
	userId: UserId,
}) {}

export class UserRpcs extends RpcGroup.make(
	/**
	 * UserMe
	 *
	 * Get the currently authenticated user.
	 *
	 * @returns Current user data
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("user.me", {
		payload: Schema.Void,
		success: CurrentUser.Schema,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * UserUpdate
	 *
	 * Updates an existing user.
	 * Only users with appropriate permissions can update user data.
	 *
	 * @param payload - User ID and fields to update
	 * @returns Updated user data and transaction ID
	 * @throws UserNotFoundError if user doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("user.update", {
		payload: Schema.Struct({
			id: UserId,
		}).pipe(Schema.extend(Schema.partial(User.Model.jsonUpdate))),
		success: UserResponse,
		error: Schema.Union(UserNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * UserDelete
	 *
	 * Deletes a user (soft delete).
	 * Only users with appropriate permissions can delete users.
	 *
	 * @param payload - User ID to delete
	 * @returns Transaction ID
	 * @throws UserNotFoundError if user doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("user.delete", {
		payload: Schema.Struct({ id: UserId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(UserNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * UserFinalizeOnboarding
	 *
	 * Marks the current authenticated user as having completed onboarding.
	 * This sets the isOnboarded flag to true.
	 *
	 * @returns Updated user data and transaction ID
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("user.finalizeOnboarding", {
		payload: Schema.Void,
		success: UserResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * UserResetAvatar
	 *
	 * Resets the current user's avatar to their original WorkOS profile picture
	 * (e.g., Google/GitHub OAuth avatar). Falls back to Vercel avatar if
	 * WorkOS doesn't have a profile picture.
	 *
	 * @returns Updated user data and transaction ID
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("user.resetAvatar", {
		payload: Schema.Void,
		success: UserResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
