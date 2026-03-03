import { BotRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { BotId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

/** @effect-leakable-service */
export class BotPolicy extends Effect.Service<BotPolicy>()("BotPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Bot" as const

		const botRepo = yield* BotRepo
		const orgResolver = yield* OrgResolver

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(orgResolver.requireScope(organizationId, "bots:write", policyEntity, "create"))

		const canRead = (botId: BotId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"select",
			)(
				botRepo.with(botId, (bot) =>
					policy(
						policyEntity,
						"select",
						Effect.fn(`${policyEntity}.select`)(function* (actor) {
							// Bot creator can always read
							if (bot.createdBy === actor.id) {
								return true
							}

							// Org admin can read bots in their org if installed
							if (actor.organizationId) {
								return yield* orgResolver
									.requireAdminOrOwner(
										actor.organizationId,
										"bots:read",
										policyEntity,
										"select",
									)
									.pipe(
										Effect.map(() => true),
										Effect.catchAll(() => Effect.succeed(false)),
									)
							}

							return false
						}),
					),
				),
			)

		const canUpdate = (botId: BotId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				botRepo.with(botId, (bot) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							return actor.id === bot.createdBy
						}),
					),
				),
			)

		const canDelete = (botId: BotId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				botRepo.with(botId, (bot) =>
					policy(
						policyEntity,
						"delete",
						Effect.fn(`${policyEntity}.delete`)(function* (actor) {
							return actor.id === bot.createdBy
						}),
					),
				),
			)

		const canInstall = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"install",
			)(orgResolver.requireAdminOrOwner(organizationId, "bots:write", policyEntity, "install"))

		const canUninstall = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"uninstall",
			)(orgResolver.requireAdminOrOwner(organizationId, "bots:write", policyEntity, "uninstall"))

		return { canCreate, canRead, canUpdate, canDelete, canInstall, canUninstall } as const
	}),
	dependencies: [BotRepo.Default, OrgResolver.Default],
	accessors: true,
}) {}
