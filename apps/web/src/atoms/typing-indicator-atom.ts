import type { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/db/schema"
import { Effect } from "effect"
import { ApiClient } from "~/lib/services/common/api-client"
import { runtime } from "~/lib/services/common/runtime"

interface UpsertTypingIndicatorParams {
	channelId: ChannelId
	memberId: ChannelMemberId
}

export const upsertTypingIndicator = async ({ channelId, memberId }: UpsertTypingIndicatorParams) => {
	await runtime.runPromise(
		Effect.gen(function* () {
			const client = yield* ApiClient

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

export const deleteTypingIndicator = async ({ id }: { id: TypingIndicatorId }) => {
	await runtime.runPromise(
		Effect.gen(function* () {
			const client = yield* ApiClient

			return yield* client.typingIndicators.delete({
				path: { id },
			})
		}),
	)
}
