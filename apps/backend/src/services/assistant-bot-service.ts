import type { OrganizationId } from "@hazel/domain"
import { withSystemActor } from "@hazel/domain"
import { Effect, Option } from "effect"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"
import { UserRepo } from "../repositories/user-repo"

/**
 * Assistant Bot Service
 *
 * Manages the AI assistant bot user.
 * Creates a single shared bot user for responding to @bot mentions.
 */
export class AssistantBotService extends Effect.Service<AssistantBotService>()("AssistantBotService", {
	accessors: true,
	effect: Effect.gen(function* () {
		const userRepo = yield* UserRepo
		const orgMemberRepo = yield* OrganizationMemberRepo

		/**
		 * Get or create the assistant bot user.
		 * Also ensures the bot is a member of the given organization.
		 */
		const getOrCreateBotUser = (organizationId: OrganizationId) =>
			Effect.gen(function* () {
				const externalId = "assistant-bot"

				// Try to find existing bot user
				const existing = yield* userRepo.findByExternalId(externalId).pipe(withSystemActor)

				const botUser = Option.isSome(existing)
					? existing.value
					: yield* Effect.gen(function* () {
							const newUser = yield* userRepo
								.insert({
									externalId,
									email: "assistant@bot.internal",
									firstName: "Assistant",
									lastName: "Bot",
									avatarUrl: "",
									userType: "machine",
									settings: null,
									isOnboarded: true,
									timezone: null,
									deletedAt: null,
								})
								.pipe(withSystemActor)

							return newUser[0]
						})

				// Ensure bot is a member of this organization
				yield* orgMemberRepo
					.upsertByOrgAndUser({
						organizationId,
						userId: botUser.id,
						role: "member",
						nickname: null,
						joinedAt: new Date(),
						invitedBy: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				return botUser
			})

		return { getOrCreateBotUser }
	}),
	dependencies: [UserRepo.Default, OrganizationMemberRepo.Default],
}) {}
