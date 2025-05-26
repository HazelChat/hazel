import type { ChannelId, MessageId } from "@maki-chat/api-schema/schema"
import { and, desc, eq, gt, lt } from "drizzle-orm"
import type { PgDatabase } from "drizzle-orm/pg-core"
import { messages } from "../../../../packages/drizzle/src/schema"

interface GetMessagesParams {
	channelId: ChannelId
	cursor?: MessageId
	limit?: number
}

interface MessageCursorResult {
	data: Array<typeof messages.$inferSelect>
	pagination: {
		hasNext: boolean
		hasPrevious: boolean
		nextCursor?: MessageId
		previousCursor?: string
	}
}

export async function getMessages(
	db: PgDatabase<any>,
	{ channelId, cursor, limit = 50 }: GetMessagesParams,
): Promise<MessageCursorResult> {
	const actualLimit = Math.min(limit, 100)
	const fetchLimit = actualLimit + 1

	let whereCondition = eq(messages.channelId, channelId)

	if (cursor) {
		const cursorMessage = await db
			.select({ createdAt: messages.createdAt })
			.from(messages)
			.where(eq(messages.id, cursor))
			.limit(1)

		if (cursorMessage.length > 0) {
			whereCondition = and(
				eq(messages.channelId, channelId),
				lt(messages.createdAt, cursorMessage[0].createdAt!),
			)!
		}
	}

	const results = await db
		.select()
		.from(messages)
		.where(whereCondition)
		.orderBy(desc(messages.createdAt), desc(messages.id))
		.limit(fetchLimit)

	const hasNext = results.length > actualLimit
	const data = hasNext ? results.slice(0, actualLimit) : results

	const hasPrevious = !!cursor

	const nextCursor = hasNext ? (data[data.length - 1].id as MessageId) : undefined
	const previousCursor = cursor

	return {
		data,
		pagination: {
			hasNext,
			hasPrevious,
			nextCursor,
			previousCursor,
		},
	}
}
