import { Rpc, RpcGroup } from "@effect/rpc"
import { Organization } from "@hazel/db/models"
import { OrganizationId } from "@hazel/db/schema"
import { InternalServerError, TransactionId, UnauthorizedError } from "@hazel/effect-lib"
import { Schema } from "effect"
import { AuthMiddleware } from "../middleware/auth-class"

/**
 * Response schema for successful organization operations.
 * Contains the organization data and a transaction ID for optimistic updates.
 */
export class OrganizationResponse extends Schema.Class<OrganizationResponse>("OrganizationResponse")({
	data: Organization.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Error thrown when an organization is not found.
 * Used in update and delete operations.
 */
export class OrganizationNotFoundError extends Schema.TaggedError<OrganizationNotFoundError>()(
	"OrganizationNotFoundError",
	{
		organizationId: OrganizationId,
	},
) {}

/**
 * Error thrown when trying to create or update an organization with a slug that already exists.
 */
export class OrganizationSlugAlreadyExistsError extends Schema.TaggedError<OrganizationSlugAlreadyExistsError>()(
	"OrganizationSlugAlreadyExistsError",
	{
		message: Schema.String,
		slug: Schema.String,
	},
) {}

export class OrganizationRpcs extends RpcGroup.make(
	Rpc.make("organization.create", {
		payload: Organization.Model.jsonCreate,
		success: OrganizationResponse,
		error: Schema.Union(OrganizationSlugAlreadyExistsError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.make("organization.update", {
		payload: Schema.Struct({
			id: OrganizationId,
			...Organization.Model.jsonUpdate.fields,
		}),
		success: OrganizationResponse,
		error: Schema.Union(
			OrganizationNotFoundError,
			OrganizationSlugAlreadyExistsError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	Rpc.make("organization.delete", {
		payload: Schema.Struct({ id: OrganizationId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.make("organization.setSlug", {
		payload: Schema.Struct({
			id: OrganizationId,
			slug: Schema.String,
		}),
		success: OrganizationResponse,
		error: Schema.Union(
			OrganizationNotFoundError,
			OrganizationSlugAlreadyExistsError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),
) {}
