import { Rpc, RpcGroup } from "effect/unstable/rpc"
import { Schema } from "effect"
import * as CurrentUser from "../current-user"
import { InternalServerError, UnauthorizedError } from "../errors"
import { UserId } from "@hazel/schema"
import { User } from "../models"
import { TransactionId } from "@hazel/schema"
import { AuthMiddleware } from "./middleware"
import { RequiredScopes } from "../scopes/required-scopes"

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
export class UserNotFoundError extends Schema.TaggedErrorClass<UserNotFoundError>()("UserNotFoundError", {
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
	Rpc.make("user.me", {
		payload: Schema.Void,
		success: CurrentUser.Schema,
		error: Schema.Union([UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["users:read"])
		.middleware(AuthMiddleware),

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
	Rpc.make("user.update", {
		payload: Schema.Struct({
			id: UserId,
		}).pipe((s: any) => Schema.Struct({ ...s.fields, ...(User.Model.jsonUpdate as any).fields }) as any),
		success: UserResponse,
		error: Schema.Union([UserNotFoundError, UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["users:write"])
		.middleware(AuthMiddleware),

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
	Rpc.make("user.delete", {
		payload: Schema.Struct({ id: UserId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union([UserNotFoundError, UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["users:write"])
		.middleware(AuthMiddleware),

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
	Rpc.make("user.finalizeOnboarding", {
		payload: Schema.Void,
		success: UserResponse,
		error: Schema.Union([UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["users:write"])
		.middleware(AuthMiddleware),

	/**
	 * UserResetAvatar
	 *
	 * Resets the current user's avatar to their original WorkOS profile picture
	 * (e.g., Google/GitHub OAuth avatar). Clears the avatar if WorkOS doesn't have
	 * a profile picture.
	 *
	 * @returns Updated user data and transaction ID
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("user.resetAvatar", {
		payload: Schema.Void,
		success: UserResponse,
		error: Schema.Union([UnauthorizedError, InternalServerError]),
	})
		.annotate(RequiredScopes, ["users:write"])
		.middleware(AuthMiddleware),
) {}
