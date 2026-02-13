import { describe, expect, it } from "@effect/vitest"

import { extractReactionAuthor } from "./discord-gateway-service"

describe("DiscordGatewayService reaction author extraction", () => {
	it("prefers member.user for reaction events", () => {
		const result = extractReactionAuthor({
			member: {
				user: {
					id: "111",
					global_name: "Global Nick",
					username: "guild_user",
					avatar: "global-avatar",
					discriminator: "1234",
				},
			},
			user: {
				id: "999",
				global_name: "Member User",
				username: "other_user",
				avatar: "other-avatar",
				discriminator: "5678",
			},
		})

		expect(result.externalAuthorDisplayName).toBe("Global Nick")
		expect(result.externalAuthorAvatarUrl).toBe(
			"https://cdn.discordapp.com/avatars/111/global-avatar.png",
		)
	})

	it("falls back when reaction actor fields are missing", () => {
		const result = extractReactionAuthor({})

		expect(result.externalAuthorDisplayName).toBeUndefined()
		expect(result.externalAuthorAvatarUrl).toBeUndefined()
	})
})
