import { HttpApiBuilder } from "@effect/platform"
import { AttachmentRepo, BotRepo, OrganizationRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, UnauthorizedError, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import {
	BotNotFoundForUploadError,
	OrganizationNotFoundForUploadError,
	UploadError,
} from "@hazel/domain/http"
import { AttachmentId } from "@hazel/domain/ids"
import { S3 } from "@hazel/effect-bun"
import { randomUUIDv7 } from "bun"
import { Effect, Match, Option } from "effect"
import { HazelApi } from "../api"
import { AttachmentPolicy } from "../policies/attachment-policy"
import { OrganizationPolicy } from "../policies/organization-policy"
import { checkAvatarRateLimit } from "../services/rate-limit-helpers"

/**
 * Get the public URL base for uploaded files.
 * Falls back to empty string if not configured (frontend can still construct URL).
 */
const getPublicUrlBase = (): string => {
	return process.env.S3_PUBLIC_URL ?? ""
}

export const HttpUploadsLive = HttpApiBuilder.group(HazelApi, "uploads", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database
		const s3 = yield* S3

		return handlers.handle(
			"presign",
			Effect.fn(function* ({ payload }) {
				const user = yield* CurrentUser.Context
				const publicUrlBase = getPublicUrlBase()

				return yield* Match.value(payload).pipe(
					// ============ User Avatar Upload ============
					Match.when({ type: "user-avatar" }, (req) =>
						Effect.gen(function* () {
							// Check rate limit (5 per hour)
							yield* checkAvatarRateLimit(user.id)

							const key = `avatars/${user.id}/${randomUUIDv7()}`

							yield* Effect.logDebug(
								`Generating presigned URL for user avatar upload: ${key} (size: ${req.fileSize} bytes, type: ${req.contentType})`,
							)

							const uploadUrl = yield* s3
								.presign(key, {
									acl: "public-read",
									method: "PUT",
									type: req.contentType,
									expiresIn: 300, // 5 minutes
								})
								.pipe(
									Effect.mapError(
										(error) =>
											new UploadError({
												message: `Failed to generate presigned URL: ${error.message}`,
											}),
									),
								)

							yield* Effect.logDebug(`Generated presigned URL for user avatar: ${key}`)

							return {
								uploadUrl,
								key,
								publicUrl: publicUrlBase ? `${publicUrlBase}/${key}` : key,
							}
						}),
					),

					// ============ Bot Avatar Upload ============
					Match.when({ type: "bot-avatar" }, (req) =>
						Effect.gen(function* () {
							const botRepo = yield* BotRepo

							// Check if bot exists
							const botOption = yield* botRepo
								.findById(req.botId)
								.pipe(withSystemActor, Effect.orDie)
							if (Option.isNone(botOption)) {
								return yield* Effect.fail(new BotNotFoundForUploadError({ botId: req.botId }))
							}

							const bot = botOption.value

							// Check if user is the bot creator (only bot creator can update avatar)
							if (bot.createdBy !== user.id) {
								return yield* Effect.fail(
									new UnauthorizedError({
										message: "Unauthorized",
										detail: "Only the bot creator can update the avatar",
									}),
								)
							}

							// Check rate limit (5 per hour)
							yield* checkAvatarRateLimit(user.id)

							const key = `avatars/bots/${req.botId}/${randomUUIDv7()}`

							yield* Effect.logDebug(
								`Generating presigned URL for bot avatar upload: ${key} (size: ${req.fileSize} bytes, type: ${req.contentType})`,
							)

							const uploadUrl = yield* s3
								.presign(key, {
									acl: "public-read",
									method: "PUT",
									type: req.contentType,
									expiresIn: 300, // 5 minutes
								})
								.pipe(
									Effect.mapError(
										(error) =>
											new UploadError({
												message: `Failed to generate presigned URL: ${error.message}`,
											}),
									),
								)

							yield* Effect.logDebug(`Generated presigned URL for bot avatar: ${key}`)

							return {
								uploadUrl,
								key,
								publicUrl: publicUrlBase ? `${publicUrlBase}/${key}` : key,
							}
						}),
					),

					// ============ Organization Avatar Upload ============
					Match.when({ type: "organization-avatar" }, (req) =>
						Effect.gen(function* () {
							const orgRepo = yield* OrganizationRepo

							// Check if organization exists
							const orgOption = yield* orgRepo
								.findById(req.organizationId)
								.pipe(withSystemActor, Effect.orDie)
							if (Option.isNone(orgOption)) {
								return yield* Effect.fail(
									new OrganizationNotFoundForUploadError({
										organizationId: req.organizationId,
									}),
								)
							}

							// Check if user is an admin or owner of the organization
							yield* Effect.void.pipe(
								policyUse(OrganizationPolicy.canUpdate(req.organizationId)),
							)

							// Check rate limit (5 per hour)
							yield* checkAvatarRateLimit(user.id)

							const key = `avatars/organizations/${req.organizationId}/${randomUUIDv7()}`

							yield* Effect.logDebug(
								`Generating presigned URL for organization avatar upload: ${key} (size: ${req.fileSize} bytes, type: ${req.contentType})`,
							)

							const uploadUrl = yield* s3
								.presign(key, {
									acl: "public-read",
									method: "PUT",
									type: req.contentType,
									expiresIn: 300, // 5 minutes
								})
								.pipe(
									Effect.mapError(
										(error) =>
											new UploadError({
												message: `Failed to generate presigned URL: ${error.message}`,
											}),
									),
								)

							yield* Effect.logDebug(`Generated presigned URL for organization avatar: ${key}`)

							return {
								uploadUrl,
								key,
								publicUrl: publicUrlBase ? `${publicUrlBase}/${key}` : key,
							}
						}),
					),

					// ============ Attachment Upload ============
					Match.when({ type: "attachment" }, (req) =>
						Effect.gen(function* () {
							const attachmentId = AttachmentId.make(randomUUIDv7())

							yield* Effect.logDebug(
								`Generating presigned URL for attachment upload: ${attachmentId} (size: ${req.fileSize} bytes, type: ${req.contentType})`,
							)

							// Create attachment record with "uploading" status
							// Validates user has permission to upload to the specified channel/org
							yield* db
								.transaction(
									Effect.gen(function* () {
										yield* AttachmentRepo.insert({
											id: attachmentId,
											uploadedBy: user.id,
											organizationId: req.organizationId,
											status: "uploading",
											channelId: req.channelId,
											messageId: null,
											fileName: req.fileName,
											fileSize: req.fileSize,
											uploadedAt: new Date(),
										})
									}),
								)
								.pipe(
									withRemapDbErrors("AttachmentRepo", "create"),
									policyUse(AttachmentPolicy.canCreate()),
								)

							// Generate presigned URL
							const uploadUrl = yield* s3
								.presign(attachmentId, {
									acl: "public-read",
									method: "PUT",
									type: req.contentType,
									expiresIn: 300, // 5 minutes
								})
								.pipe(
									Effect.mapError(
										(error) =>
											new UploadError({
												message: `Failed to generate presigned URL: ${error.message}`,
											}),
									),
								)

							yield* Effect.logDebug(`Generated presigned URL for attachment: ${attachmentId}`)

							return {
								uploadUrl,
								key: attachmentId,
								publicUrl: publicUrlBase ? `${publicUrlBase}/${attachmentId}` : attachmentId,
								resourceId: attachmentId,
							}
						}),
					),

					Match.exhaustive,
				)
			}),
		)
	}),
)
