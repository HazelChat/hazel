import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"
import { CurrentUser, InternalServerError, UnauthorizedError } from "../"
import { AttachmentId, BotId, ChannelId, OrganizationId } from "../ids"
import { RateLimitExceededError } from "../rate-limit-errors"

// ============ Constants ============

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

// ============ Upload Type Schema ============

export const UploadType = Schema.Literal("user-avatar", "bot-avatar", "organization-avatar", "attachment")
export type UploadType = typeof UploadType.Type

// ============ Request Schemas ============

/**
 * Base fields shared by all upload types
 */
const BaseUploadFields = {
	contentType: Schema.String,
	fileSize: Schema.Number,
}

/**
 * User avatar upload request
 */
export class UserAvatarUploadRequest extends Schema.Class<UserAvatarUploadRequest>("UserAvatarUploadRequest")(
	{
		type: Schema.Literal("user-avatar"),
		contentType: Schema.String.pipe(
			Schema.filter((s) => ALLOWED_AVATAR_TYPES.includes(s as (typeof ALLOWED_AVATAR_TYPES)[number]), {
				message: () => "Content type must be image/jpeg, image/png, or image/webp",
			}),
		),
		fileSize: Schema.Number.pipe(
			Schema.between(1, MAX_AVATAR_SIZE, {
				message: () => "File size must be between 1 byte and 5MB",
			}),
		),
	},
) {}

/**
 * Bot avatar upload request
 */
export class BotAvatarUploadRequest extends Schema.Class<BotAvatarUploadRequest>("BotAvatarUploadRequest")({
	type: Schema.Literal("bot-avatar"),
	botId: BotId,
	contentType: Schema.String.pipe(
		Schema.filter((s) => ALLOWED_AVATAR_TYPES.includes(s as (typeof ALLOWED_AVATAR_TYPES)[number]), {
			message: () => "Content type must be image/jpeg, image/png, or image/webp",
		}),
	),
	fileSize: Schema.Number.pipe(
		Schema.between(1, MAX_AVATAR_SIZE, {
			message: () => "File size must be between 1 byte and 5MB",
		}),
	),
}) {}

/**
 * Organization avatar upload request
 */
export class OrganizationAvatarUploadRequest extends Schema.Class<OrganizationAvatarUploadRequest>(
	"OrganizationAvatarUploadRequest",
)({
	type: Schema.Literal("organization-avatar"),
	organizationId: OrganizationId,
	contentType: Schema.String.pipe(
		Schema.filter((s) => ALLOWED_AVATAR_TYPES.includes(s as (typeof ALLOWED_AVATAR_TYPES)[number]), {
			message: () => "Content type must be image/jpeg, image/png, or image/webp",
		}),
	),
	fileSize: Schema.Number.pipe(
		Schema.between(1, MAX_AVATAR_SIZE, {
			message: () => "File size must be between 1 byte and 5MB",
		}),
	),
}) {}

/**
 * Attachment upload request
 */
export class AttachmentUploadRequest extends Schema.Class<AttachmentUploadRequest>("AttachmentUploadRequest")(
	{
		type: Schema.Literal("attachment"),
		fileName: Schema.String,
		contentType: Schema.String,
		fileSize: Schema.Number.pipe(
			Schema.between(1, MAX_ATTACHMENT_SIZE, {
				message: () => "File size must be between 1 byte and 10MB",
			}),
		),
		organizationId: OrganizationId,
		channelId: ChannelId,
	},
) {}

/**
 * Unified presign upload request - discriminated union of all upload types
 */
export const PresignUploadRequest = Schema.Union(
	UserAvatarUploadRequest,
	BotAvatarUploadRequest,
	OrganizationAvatarUploadRequest,
	AttachmentUploadRequest,
)
export type PresignUploadRequest = typeof PresignUploadRequest.Type

// ============ Response Schema ============

/**
 * Unified presign upload response
 *
 * - uploadUrl: The presigned URL to upload the file to
 * - key: The storage key (path) where the file will be stored
 * - publicUrl: The public URL to access the file after upload
 * - resourceId: For attachments, the AttachmentId; undefined for avatars
 */
export class PresignUploadResponse extends Schema.Class<PresignUploadResponse>("PresignUploadResponse")({
	uploadUrl: Schema.String,
	key: Schema.String,
	publicUrl: Schema.String,
	resourceId: Schema.optional(AttachmentId),
}) {}

// ============ Error Schemas ============

export class UploadError extends Schema.TaggedError<UploadError>("UploadError")(
	"UploadError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 500,
	}),
) {}

export class BotNotFoundForUploadError extends Schema.TaggedError<BotNotFoundForUploadError>(
	"BotNotFoundForUploadError",
)(
	"BotNotFoundForUploadError",
	{
		botId: BotId,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

export class OrganizationNotFoundForUploadError extends Schema.TaggedError<OrganizationNotFoundForUploadError>(
	"OrganizationNotFoundForUploadError",
)(
	"OrganizationNotFoundForUploadError",
	{
		organizationId: OrganizationId,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

// ============ API Group ============

/**
 * Uploads API Group
 *
 * Unified endpoint for all file uploads (user avatars, bot avatars, attachments).
 * Rate limiting for avatars (5 req/hour per user) is applied in the handler.
 */
export class UploadsGroup extends HttpApiGroup.make("uploads")
	.add(
		HttpApiEndpoint.post("presign", "/presign")
			.setPayload(PresignUploadRequest)
			.addSuccess(PresignUploadResponse)
			.addError(UploadError)
			.addError(BotNotFoundForUploadError)
			.addError(OrganizationNotFoundForUploadError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.addError(RateLimitExceededError),
	)
	.prefix("/uploads")
	.middleware(CurrentUser.Authorization) {}
