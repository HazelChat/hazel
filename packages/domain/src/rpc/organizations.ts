import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { OrganizationId } from "../ids"
import { Organization } from "../models"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"

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

/**
 * Error thrown when trying to join an organization via public invite but the org has public invites disabled.
 */
export class PublicInviteDisabledError extends Schema.TaggedError<PublicInviteDisabledError>()(
	"PublicInviteDisabledError",
	{
		organizationId: OrganizationId,
	},
) {}

/**
 * Error thrown when a user is already a member of the organization they're trying to join.
 */
export class AlreadyMemberError extends Schema.TaggedError<AlreadyMemberError>()("AlreadyMemberError", {
	organizationId: OrganizationId,
	organizationSlug: Schema.NullOr(Schema.String),
}) {}

/**
 * Public organization info response for unauthenticated users.
 * Contains only public information that's safe to expose.
 */
export class PublicOrganizationInfo extends Schema.Class<PublicOrganizationInfo>("PublicOrganizationInfo")({
	id: OrganizationId,
	name: Schema.String,
	slug: Schema.NullOr(Schema.String),
	logoUrl: Schema.NullOr(Schema.String),
	memberCount: Schema.Number,
}) {}

export class OrganizationRpcs extends RpcGroup.make(
	Rpc.mutation("organization.create", {
		payload: Organization.Model.jsonCreate,
		success: OrganizationResponse,
		error: Schema.Union(OrganizationSlugAlreadyExistsError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.mutation("organization.update", {
		payload: Schema.Struct({
			id: OrganizationId,
		}).pipe(Schema.extend(Schema.partial(Organization.Model.jsonUpdate))),
		success: OrganizationResponse,
		error: Schema.Union(
			OrganizationNotFoundError,
			OrganizationSlugAlreadyExistsError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	Rpc.mutation("organization.delete", {
		payload: Schema.Struct({ id: OrganizationId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	Rpc.mutation("organization.setSlug", {
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

	/**
	 * Toggle public invite mode for an organization.
	 * When enabled, anyone with the invite URL can join the workspace.
	 * Only admins/owners can modify this setting.
	 */
	Rpc.mutation("organization.setPublicMode", {
		payload: Schema.Struct({
			id: OrganizationId,
			isPublic: Schema.Boolean,
		}),
		success: OrganizationResponse,
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * Get public organization info by slug.
	 * Returns limited organization info for the join page.
	 * No authentication required - only returns data if org has isPublic=true.
	 */
	Rpc.query("organization.getBySlugPublic", {
		payload: Schema.Struct({
			slug: Schema.String,
		}),
		success: Schema.NullOr(PublicOrganizationInfo),
		error: InternalServerError,
	}),

	/**
	 * Join an organization via public invite link.
	 * Requires authentication. Creates membership with "member" role.
	 */
	Rpc.mutation("organization.joinViaPublicInvite", {
		payload: Schema.Struct({
			slug: Schema.String,
		}),
		success: OrganizationResponse,
		error: Schema.Union(
			OrganizationNotFoundError,
			PublicInviteDisabledError,
			AlreadyMemberError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * Generate a WorkOS Admin Portal link.
	 * Only admins and owners can access the admin portal.
	 * Supports different intents: sso, domain_verification, dsync, audit_logs, etc.
	 */
	Rpc.mutation("organization.getAdminPortalLink", {
		payload: Schema.Struct({
			id: OrganizationId,
			intent: Schema.Literal("sso", "domain_verification", "dsync", "audit_logs", "log_streams"),
		}),
		success: Schema.Struct({ link: Schema.String }),
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * List all domains for an organization.
	 * Only admins/owners can list domains.
	 */
	Rpc.query("organization.listDomains", {
		payload: Schema.Struct({ id: OrganizationId }),
		success: Schema.Array(
			Schema.Struct({
				id: Schema.String,
				domain: Schema.String,
				state: Schema.Literal("pending", "verified", "failed", "legacy_verified"),
				verificationToken: Schema.NullOr(Schema.String),
			}),
		),
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * Add a domain to an organization.
	 * Only admins/owners can add domains.
	 */
	Rpc.mutation("organization.addDomain", {
		payload: Schema.Struct({
			id: OrganizationId,
			domain: Schema.String,
		}),
		success: Schema.Struct({
			id: Schema.String,
			domain: Schema.String,
			state: Schema.String,
			verificationToken: Schema.NullOr(Schema.String),
		}),
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * Remove a domain from an organization.
	 * Only admins/owners can remove domains.
	 */
	Rpc.mutation("organization.removeDomain", {
		payload: Schema.Struct({
			id: OrganizationId,
			domainId: Schema.String,
		}),
		success: Schema.Struct({ success: Schema.Boolean }),
		error: Schema.Union(OrganizationNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
