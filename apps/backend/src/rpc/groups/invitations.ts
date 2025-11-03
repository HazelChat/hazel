import { Rpc, RpcGroup } from "@effect/rpc"
import { Invitation } from "@hazel/db/models"
import { InvitationId, OrganizationId } from "@hazel/db/schema"
import { InternalServerError, UnauthorizedError } from "@hazel/effect-lib"
import { Schema } from "effect"
import { TransactionId } from "../../lib/schema"
import { AuthMiddleware } from "../middleware/auth-class"

/**
 * Response schema for successful invitation operations.
 * Contains the invitation data and a transaction ID for optimistic updates.
 */
export class InvitationResponse extends Schema.Class<InvitationResponse>("InvitationResponse")({
	data: Invitation.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Error thrown when an invitation is not found.
 * Used in update and delete operations.
 */
export class InvitationNotFoundError extends Schema.TaggedError<InvitationNotFoundError>()(
	"InvitationNotFoundError",
	{
		invitationId: InvitationId,
	},
) {}

export class InvitationRpcs extends RpcGroup.make(
	/**
	 * InvitationCreate
	 *
	 * Creates a new invitation to an organization via WorkOS.
	 * The inviter must have permission to invite users to the organization.
	 *
	 * @param payload - Invitation data (organizationId, email)
	 * @returns Invitation data and transaction ID
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("invitation.create", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
			email: Schema.String,
			role: Schema.Literal("member", "admin"),
		}),
		success: InvitationResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * InvitationResend
	 *
	 * Resends an existing invitation via WorkOS.
	 * Only the invitation creator or organization admins can resend.
	 *
	 * @param payload - Invitation ID to resend
	 * @returns Invitation data and transaction ID
	 * @throws InvitationNotFoundError if invitation doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("invitation.resend", {
		payload: Schema.Struct({ invitationId: InvitationId }),
		success: InvitationResponse,
		error: Schema.Union(InvitationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * InvitationRevoke
	 *
	 * Revokes an existing invitation via WorkOS.
	 * Only the invitation creator or organization admins can revoke.
	 *
	 * @param payload - Invitation ID to revoke
	 * @returns Transaction ID
	 * @throws InvitationNotFoundError if invitation doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("invitation.revoke", {
		payload: Schema.Struct({ invitationId: InvitationId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(InvitationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * InvitationUpdate
	 *
	 * Updates an existing invitation.
	 * Can be used to change invitation status, role, or other properties.
	 *
	 * @param payload - Invitation ID and fields to update
	 * @returns Updated invitation data and transaction ID
	 * @throws InvitationNotFoundError if invitation doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("invitation.update", {
		payload: Schema.Struct({
			id: InvitationId,
			...Invitation.Model.jsonUpdate.fields,
		}),
		success: InvitationResponse,
		error: Schema.Union(InvitationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * InvitationDelete
	 *
	 * Deletes an invitation.
	 * Only the invitation creator or users with appropriate permissions can delete.
	 *
	 * @param payload - Invitation ID to delete
	 * @returns Transaction ID
	 * @throws InvitationNotFoundError if invitation doesn't exist
	 * @throws UnauthorizedError if user lacks permission
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.make("invitation.delete", {
		payload: Schema.Struct({ id: InvitationId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(InvitationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
