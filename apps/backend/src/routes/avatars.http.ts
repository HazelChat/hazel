import { HttpApiBuilder } from "@effect/platform"
import { CurrentUser } from "@hazel/domain"
import { AvatarUploadError } from "@hazel/domain/http"
import { S3 } from "@hazel/effect-bun"
import { randomUUIDv7 } from "bun"
import { Effect } from "effect"
import { HazelApi } from "../api"
import { checkAvatarRateLimit } from "../services/rate-limit-helpers"

export const HttpAvatarLive = HttpApiBuilder.group(HazelApi, "avatars", (handlers) =>
	Effect.gen(function* () {
		const s3 = yield* S3

		return handlers.handle(
			"getUploadUrl",
			Effect.fn(function* ({ payload }) {
				const user = yield* CurrentUser.Context

				// Check rate limit before processing (5 per hour)
				yield* checkAvatarRateLimit(user.id)

				const key = `avatars/${user.id}/${randomUUIDv7()}`

				yield* Effect.logDebug(
					`Generating presigned URL for avatar upload: ${key} (size: ${payload.fileSize} bytes, type: ${payload.contentType})`,
				)

				// Generate presigned URL
				const uploadUrl = yield* s3
					.presign(key, {
						acl: "public-read",
						method: "PUT",
						type: payload.contentType,
						expiresIn: 300, // 5 minutes
					})
					.pipe(
						Effect.mapError(
							(error) =>
								new AvatarUploadError({
									message: `Failed to generate presigned URL: ${error.message}`,
								}),
						),
					)

				yield* Effect.logDebug(`Generated presigned URL for avatar: ${key}`)

				return {
					uploadUrl,
					key,
				}
			}),
		)
	}),
)
