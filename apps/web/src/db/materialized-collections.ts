import { createCollection, eq, liveQueryCollectionOptions } from "@tanstack/react-db"
import { channelCollection, channelMemberCollection, userCollection } from "./collections"

export const channelMemberWithUserCollection = createCollection(
	liveQueryCollectionOptions({
		query: (q) =>
			q
				.from({ member: channelMemberCollection })
				.innerJoin({ user: userCollection }, ({ member, user }) => eq(member.userId, user.id))
				.select(({ member, user }) => ({ ...member, user })),
	}),
)

// Threads with their member data (for sidebar display)
export const threadWithMemberCollection = createCollection(
	liveQueryCollectionOptions({
		query: (q) =>
			q
				.from({ channel: channelCollection })
				.innerJoin({ member: channelMemberCollection }, ({ channel, member }) =>
					eq(member.channelId, channel.id),
				)
				.where(({ channel }) => eq(channel.type, "thread"))
				.select(({ channel, member }) => ({ channel, member })),
	}),
)
