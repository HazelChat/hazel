import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { InternalServerError, UnauthorizedError } from "../errors"
import { AttachmentId } from "../ids"
import { Attachment } from "../models"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"

/**
 * Error thrown when an attachment is not found.
 * Used in delete operations.
 */
export class AttachmentNotFoundError extends Schema.TaggedError<AttachmentNotFoundError>()(
	"AttachmentNotFoundError",
	{
		attachmentId: AttachmentId,
	},
) {}

/**
 * Attachment RPC Group
 *
 * Defines RPC methods for attachment operations:
 * - AttachmentDelete: Delete an attachment
 *
 * All methods require authentication via AuthMiddleware.
 *
 * Example usage from frontend:
 * ```typescript
 * const client = yield* RpcClient
 *
 * // Delete attachment
 * yield* client.AttachmentDelete({ id: "..." })
 * ```
 */
export class AttachmentRpcs extends RpcGroup.make(
	/**
	 * AttachmentDelete
	 *
	 * Deletes an attachment (soft delete).
	 * Only the uploader or users with appropriate permissions can delete.
	 *
	 * @param payload - Attachment ID to delete
	 * @returns Transaction ID
	 * @throws AttachmentNotFoundError if attachment doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("attachment.delete", {
		payload: Schema.Struct({ id: AttachmentId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(AttachmentNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
