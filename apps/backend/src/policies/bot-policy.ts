import { BotRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import {
	type BotId,
	ErrorUtils,
	type OrganizationId,
	policy,
	type UserId,
	withSystemActor,
} from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

/** @effect-leakable-service */
export class BotPolicy extends Effect.Service<BotPolicy>()("BotPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Bot" as const

		const botRepo = yield* BotRepo
		const orgMemberRepo = yield* OrganizationMemberRepo

		// Helper: check if user is org admin
		const isOrgAdmin = (organizationId: OrganizationId, actorId: UserId) =>
			Effect.gen(function* () {
				const member = yield* orgMemberRepo
					.findByOrgAndUser(organizationId, actorId)
					.pipe(withSystemActor)

				if (Option.isNone(member)) {
					return false
				}

				return isAdminOrOwner(member.value.role)
			})

		// Can create a bot (any authenticated user with an organization)
		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.create`)(function* (actor) {
						// User must be a member of the organization
						const member = yield* orgMemberRepo
							.findByOrgAndUser(organizationId, actor.id)
							.pipe(withSystemActor)

						return Option.isSome(member)
					}),
				),
			)

		// Can read a bot (org admin or bot creator)
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
								return yield* isOrgAdmin(actor.organizationId, actor.id)
							}

							return false
						}),
					),
				),
			)

		// Can update a bot (bot creator or org admin in creator's org)
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
							// Only bot creator can update
							return bot.createdBy === actor.id
						}),
					),
				),
			)

		// Can delete a bot (bot creator only)
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
							// Only bot creator can delete
							return bot.createdBy === actor.id
						}),
					),
				),
			)

		// Can install a bot (org admin only)
		const canInstall = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"install",
			)(
				policy(
					policyEntity,
					"install",
					Effect.fn(`${policyEntity}.install`)(function* (actor) {
						return yield* isOrgAdmin(organizationId, actor.id)
					}),
				),
			)

		// Can uninstall a bot (org admin only)
		const canUninstall = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"uninstall",
			)(
				policy(
					policyEntity,
					"uninstall",
					Effect.fn(`${policyEntity}.uninstall`)(function* (actor) {
						return yield* isOrgAdmin(organizationId, actor.id)
					}),
				),
			)

		return { canCreate, canRead, canUpdate, canDelete, canInstall, canUninstall } as const
	}),
	dependencies: [BotRepo.Default, OrganizationMemberRepo.Default],
	accessors: true,
}) {}
