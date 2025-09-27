import { type ChannelId, type ChannelMemberId, TypingIndicatorId } from "@hazel/db/schema"
import { Effect } from "effect"
import { getBackendClient } from "~/lib/client"
import { authClient } from "~/providers/workos-provider"

interface UpsertTypingIndicatorParams {
	channelId: ChannelId
	memberId: ChannelMemberId
}

// Function for upserting typing indicators
export const upsertTypingIndicator = async ({ channelId, memberId }: UpsertTypingIndicatorParams) => {
	const workOsClient = await authClient
	const accessToken = await workOsClient.getAccessToken()

	// Send to backend (which will do the actual upsert)
	await Effect.runPromise(
		Effect.gen(function* () {
			const client = yield* getBackendClient(accessToken)

			return yield* client.typingIndicators.create({
				payload: {
					channelId,
					memberId,
					lastTyped: Date.now(),
				},
			})
		}),
	)
}

// Function for deleting typing indicators (if needed)
export const deleteTypingIndicator = async ({ id }: { id: TypingIndicatorId }) => {
	const workOsClient = await authClient
	const accessToken = await workOsClient.getAccessToken()

	await Effect.runPromise(
		Effect.gen(function* () {
			const client = yield* getBackendClient(accessToken)

			return yield* client.typingIndicators.delete({
				path: { id },
			})
		}),
	)
}
