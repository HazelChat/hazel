import { ChannelRepo, OrganizationMemberRepo, PinnedMessageRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { ChannelId, PinnedMessageId } from "@hazel/schema"
import { ServiceMap, Effect, Layer, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

export class PinnedMessagePolicy extends ServiceMap.Service<PinnedMessagePolicy>()("PinnedMessagePolicy/Policy", {
	make: Effect.gen(function* () {
		const policyEntity = "PinnedMessage" as const

		const pinnedMessageRepo = yield* PinnedMessageRepo
		const channelRepo = yield* ChannelRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const orgResolver = yield* OrgResolver

		const canUpdate = (id: PinnedMessageId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				pinnedMessageRepo.with(id, (pinnedMessage) =>
					channelRepo.with(pinnedMessage.channelId, (channel) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								if (actor.id === pinnedMessage.pinnedBy) {
									return yield* Effect.succeed(true)
								}

								const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
									channel.organizationId,
									actor.id,
								)

								if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
									return yield* Effect.succeed(true)
								}

								return yield* Effect.succeed(false)
							}),
						),
					),
				),
			)

		const canCreate = (channelId: ChannelId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				channelRepo.with(channelId, (channel) =>
					policy(
						policyEntity,
						"create",
						Effect.fn(`${policyEntity}.create`)(function* (actor) {
							const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
								channel.organizationId,
								actor.id,
							)

							if (Option.isNone(orgMember)) {
								return yield* Effect.succeed(false)
							}

							if (isAdminOrOwner(orgMember.value.role)) {
								return yield* Effect.succeed(true)
							}

							// Regular members can pin in public channels
							if (channel.type === "public") {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		const canDelete = (id: PinnedMessageId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				pinnedMessageRepo.with(id, (pinnedMessage) =>
					channelRepo.with(pinnedMessage.channelId, (channel) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								if (actor.id === pinnedMessage.pinnedBy) {
									return yield* Effect.succeed(true)
								}

								const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
									channel.organizationId,
									actor.id,
								)

								if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
									return yield* Effect.succeed(true)
								}

								return yield* Effect.succeed(false)
							}),
						),
					),
				),
			)

		return { canCreate, canDelete, canUpdate } as const
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(PinnedMessageRepo.Default),
		Layer.provide(ChannelRepo.Default),
		Layer.provide(OrganizationMemberRepo.Default),
		Layer.provide(OrgResolver.Default),
	)
}
