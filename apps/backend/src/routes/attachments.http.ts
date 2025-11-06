import { FileSystem, HttpApiBuilder } from "@effect/platform"
import { MultipartUpload } from "@effect-aws/s3"
import { Database } from "@hazel/db"
import { AttachmentId } from "@hazel/db/schema"
import { CurrentUser, policyUse, withRemapDbErrors } from "@hazel/effect-lib"
import { randomUUIDv7 } from "bun"
import { Config, Effect } from "effect"
import { HazelApi } from "../api"
import { AttachmentUploadError } from "../api/electric/collections/attachments"
import { generateTransactionId } from "../lib/create-transactionId"
import { AttachmentPolicy } from "../policies/attachment-policy"
import { AttachmentRepo } from "../repositories/attachment-repo"

export const HttpAttachmentLive = HttpApiBuilder.group(HazelApi, "attachments", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database
		const mu = yield* MultipartUpload.MultipartUpload

		return handlers.handle(
			"upload",
			Effect.fn(function* ({ payload }) {
				const user = yield* CurrentUser.Context
				const fs = yield* FileSystem.FileSystem

				yield* Effect.log("Uploading attachment...")

				const attachmentId = AttachmentId.make(randomUUIDv7())

				const bucketName = yield* Config.string("R2_BUCKET_NAME").pipe(Effect.orDie)

				// Determine content type from file extension
				const getContentType = (fileName: string): string => {
					const ext = fileName.split(".").pop()?.toLowerCase()
					const contentTypes: Record<string, string> = {
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						png: "image/png",
						gif: "image/gif",
						webp: "image/webp",
						svg: "image/svg+xml",
						pdf: "application/pdf",
						mp4: "video/mp4",
						webm: "video/webm",
						mp3: "audio/mpeg",
						wav: "audio/wav",
					}
					return contentTypes[ext || ""] || "application/octet-stream"
				}

				yield* mu
					.uploadObject(
						{
							Bucket: bucketName,
							Key: attachmentId,
							Body: fs.stream(payload.file.path),
							ContentType: getContentType(payload.file.name),
						},
						{ queueSize: 3 },
					)
					.pipe(
						Effect.mapError(
							(error) =>
								new AttachmentUploadError({
									message: `Failed to upload file to R2: ${error}`,
								}),
						),
					)

				const stats = yield* fs.stat(payload.file.path).pipe(
					Effect.mapError(
						(error) =>
							new AttachmentUploadError({
								message: `Failed to read file stats: ${error}`,
							}),
					),
				)

				const { createdAttachment, txid } = yield* db
					.transaction(
						Effect.gen(function* () {
							const createdAttachment = yield* AttachmentRepo.insert({
								id: attachmentId,
								uploadedBy: user.id,
								organizationId: payload.organizationId,
								status: "complete",
								channelId: payload.channelId,
								messageId: null,
								fileName: payload.file.name,
								fileSize: Number(stats.size),
								uploadedAt: new Date(),
							}).pipe(Effect.map((res) => res[0]!))

							const txid = yield* generateTransactionId()

							return { createdAttachment, txid }
						}),
					)
					.pipe(
						withRemapDbErrors("AttachmentRepo", "create"),
						policyUse(AttachmentPolicy.canCreate()),
					)

				return {
					data: createdAttachment,
					transactionId: txid,
				}
			}),
		)
	}),
)
