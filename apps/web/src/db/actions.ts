import { AttachmentId, type ChannelId, type OrganizationId, type UserId } from "@hazel/db/schema"
import { createOptimisticAction } from "@tanstack/react-db"
import { Effect } from "effect"
import { v4 as uuid } from "uuid"
import { getBackendClient } from "~/lib/client"
import { authClient } from "~/providers/workos-provider"
import { attachmentCollection } from "./collections"

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
		const workOsClient = await authClient
		const accessToken = await workOsClient.getAccessToken()

		const formData = new FormData()
		formData.append("file", props.file, props.file.name)
		formData.append("organizationId", props.organizationId)
		formData.append("channelId", props.channelId)

		const { transactionId } = await Effect.runPromise(
			Effect.gen(function* () {
				const client = yield* getBackendClient(accessToken)

				return yield* client.attachments.upload({
					payload: formData,
				})
			}),
		)

		return { transactionId }
	},
})
