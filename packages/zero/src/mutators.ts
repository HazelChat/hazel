import type { CustomMutatorDefs } from "@rocicorp/zero"
import type { Member, schema } from "./schema"

import type { UserId } from "@maki-chat/api-schema/schema/user.js"

export interface AuthData {
	userId: typeof UserId.Type
}

export function createMutators(authData: AuthData) {
	return {
		channelMembers: {
			update: async (tx, data: Member) => {
				if (data.userId !== authData.userId) {
					throw new Error("Unauthorized")
				}

				await tx.mutate.channelMembers.update(data)
			},
		},
	} as const satisfies CustomMutatorDefs<typeof schema>
}
