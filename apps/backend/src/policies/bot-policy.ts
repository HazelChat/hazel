import { BotRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { BotId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { makeOrganizationScopeChecks, makePolicy, withPolicyUnauthorized } from "../lib/policy-utils"

/** @effect-leakable-service */
export class BotPolicy extends Effect.Service<BotPolicy>()("BotPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Bot" as const

		const botRepo = yield* BotRepo
		const orgMemberRepo = yield* OrganizationMemberRepo
		const authorize = makePolicy(policyEntity)
		const orgScope = makeOrganizationScopeChecks((organizationId, actorId) =>
			orgMemberRepo.findByOrgAndUser(organizationId, actorId).pipe(withSystemActor),
		)

		// Can create a bot (any authenticated user with an organization)
		const canCreate = (organizationId: OrganizationId) =>
			authorize("create", (actor) => orgScope.isMember(organizationId, actor.id))

		// Can read a bot (org admin or bot creator)
		const canRead = (botId: BotId) =>
			withPolicyUnauthorized(
				policyEntity,
				"select",
				botRepo.with(botId, (bot) =>
					authorize("select", (actor) =>
						Effect.gen(function* () {
							// Bot creator can always read
							if (bot.createdBy === actor.id) {
								return true
							}

							// Org admin can read bots in their org if installed
							if (actor.organizationId) {
								return yield* orgScope.isAdminOrOwner(actor.organizationId, actor.id)
							}

							return false
						}),
					),
				),
			)

		// Can update a bot (bot creator or org admin in creator's org)
		const canUpdate = (botId: BotId) =>
			withPolicyUnauthorized(
				policyEntity,
				"update",
				botRepo.with(botId, (bot) =>
					authorize("update", (actor) => Effect.succeed(bot.createdBy === actor.id)),
				),
			)

		// Can delete a bot (bot creator only)
		const canDelete = (botId: BotId) =>
			withPolicyUnauthorized(
				policyEntity,
				"delete",
				botRepo.with(botId, (bot) =>
					authorize("delete", (actor) => Effect.succeed(bot.createdBy === actor.id)),
				),
			)

		// Can install a bot (org admin only)
		const canInstall = (organizationId: OrganizationId) =>
			authorize("install", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

		// Can uninstall a bot (org admin only)
		const canUninstall = (organizationId: OrganizationId) =>
			authorize("uninstall", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

		return { canCreate, canRead, canUpdate, canDelete, canInstall, canUninstall } as const
	}),
	dependencies: [BotRepo.Default, OrganizationMemberRepo.Default],
	accessors: true,
}) {}
