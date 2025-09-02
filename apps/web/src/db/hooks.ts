import type { MessageId } from "@hazel/db/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { messageCollection, userCollection } from "./collections"

export const useMessage = (messageId: MessageId) => {
	const { data, ...rest } = useLiveQuery((q) =>
		q
			.from({ message: messageCollection })
			.innerJoin({ author: userCollection }, ({ message, author }) => eq(message.authorId, author.id))
			.where((q) => eq(q.message.id, messageId))
			.limit(1)
			.orderBy((q) => q.message.createdAt, "desc"),
	)

	const replyMessage = data?.[0]

	return {
		data: replyMessage,
		...rest,
	}
}
