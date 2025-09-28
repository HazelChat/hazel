import { AttachmentId, type ChannelId, MessageId, type OrganizationId, type UserId } from "@hazel/db/schema"
import { createOptimisticAction } from "@tanstack/react-db"
import { Effect } from "effect"
import { v4 as uuid } from "uuid"
import { ApiClient } from "~/lib/services/common/api-client"
import { runtime } from "~/lib/services/common/runtime"
import { attachmentCollection, messageCollection, typingIndicatorCollection } from "./collections"

export const uploadAttachment = createOptimisticAction<{
	organizationId: OrganizationId
	file: File
	channelId: ChannelId
	userId: UserId
	attachmentId?: AttachmentId
}>({
	onMutate: (props) => {
		const attachmentId = props.attachmentId || AttachmentId.make(uuid())

		attachmentCollection.insert({
			id: attachmentId,
			organizationId: props.organizationId,
			channelId: props.channelId,
			messageId: null,
			fileName: props.file.name,
			fileSize: props.file.size,
			uploadedBy: props.userId,
			status: "complete" as const,
			uploadedAt: new Date(),
		})

		return { attachmentId }
	},
	mutationFn: async (props, _params) => {
		const formData = new FormData()
		// Ensure file name is included when appending file
		formData.append("file", props.file, props.file.name)
		formData.append("organizationId", props.organizationId)
		formData.append("channelId", props.channelId)
		formData.append("fileName", props.file.name) // Also send file name separately

		const { transactionId } = await runtime.runPromise(
			Effect.gen(function* () {
				const client = yield* ApiClient

				return yield* client.attachments.upload({
					payload: formData,
				})
			}),
		)

		return { transactionId }
	},
})

export const sendMessage = createOptimisticAction<{
	channelId: ChannelId
	authorId: UserId
	content: string
	replyToMessageId?: MessageId | null
	threadChannelId?: ChannelId | null
	attachmentIds?: AttachmentId[]
}>({
	onMutate: (props) => {
		const messageId = MessageId.make(uuid())

		messageCollection.insert({
			id: messageId,
			channelId: props.channelId,
			authorId: props.authorId,
			content: props.content,
			replyToMessageId: props.replyToMessageId || null,
			threadChannelId: props.threadChannelId || null,
			createdAt: new Date(),
			updatedAt: null,
			deletedAt: null,
		})

		return { messageId }
	},
	mutationFn: async (props, _params) => {
		const { transactionId } = await runtime.runPromise(
			Effect.gen(function* () {
				const client = yield* ApiClient

				// Create the message with attachmentIds
				return yield* client.messages.create({
					payload: {
						channelId: props.channelId,
						content: props.content,
						replyToMessageId: props.replyToMessageId || null,
						threadChannelId: props.threadChannelId || null,
						attachmentIds: props.attachmentIds || [],
						deletedAt: null,
						authorId: props.authorId,
					},
				})
			}),
		)

		return { transactionId }
	},
})
