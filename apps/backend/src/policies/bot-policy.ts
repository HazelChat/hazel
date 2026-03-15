import { BotRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { BotId, OrganizationId } from "@hazel/schema"
import { ServiceMap, Effect, Layer } from "effect"
import { withAnnotatedScope } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

/** @effect-leakable-service */
export class BotPolicy extends ServiceMap.Service<BotPolicy>()("BotPolicy/Policy", {
	make: Effect.gen(function* () {
		const policyEntity = "Bot" as const

		const botRepo = yield* BotRepo
		const orgResolver = yield* OrgResolver

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				withAnnotatedScope((scope) =>
					orgResolver.requireScope(organizationId, scope, policyEntity, "create"),
				),
			)

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
							const orgId = actor.organizationId
							if (orgId) {
								return yield* withAnnotatedScope((scope) =>
									orgResolver.requireAdminOrOwner(orgId, scope, policyEntity, "select"),
								).pipe(
									Effect.map(() => true),
									Effect.catchTag("PermissionError", () => Effect.succeed(false)),
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
			)(
				withAnnotatedScope((scope) =>
					orgResolver.requireAdminOrOwner(organizationId, scope, policyEntity, "install"),
				),
			)

		const canUninstall = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"uninstall",
			)(
				withAnnotatedScope((scope) =>
					orgResolver.requireAdminOrOwner(organizationId, scope, policyEntity, "uninstall"),
				),
			)

		return { canCreate, canRead, canUpdate, canDelete, canInstall, canUninstall } as const
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(BotRepo.Default),
		Layer.provide(OrgResolver.Default),
	)
}
