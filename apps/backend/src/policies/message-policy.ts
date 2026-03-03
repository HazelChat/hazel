import { ChannelRepo, MessageRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { ChannelId, MessageId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

export class MessagePolicy extends Effect.Service<MessagePolicy>()("MessagePolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Message" as const

		const messageRepo = yield* MessageRepo
		const channelRepo = yield* ChannelRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const orgResolver = yield* OrgResolver

		const canCreate = (channelId: ChannelId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(orgResolver.fromChannelWithAccess(channelId, "messages:write", policyEntity, "create"))

		const canRead = (channelId: ChannelId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"read",
			)(orgResolver.fromChannelWithAccess(channelId, "messages:read", policyEntity, "read"))

		const canUpdate = (id: MessageId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				messageRepo.with(id, (message) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							// Only the author can update their own message
							return yield* Effect.succeed(actor.id === message.authorId)
						}),
					),
				),
			)

		const canDelete = (id: MessageId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				messageRepo.with(id, (message) =>
					channelRepo.with(message.channelId, (channel) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								// Author can delete their own message
								if (actor.id === message.authorId) {
									return yield* Effect.succeed(true)
								}

								// Organization admin can delete any message
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

		return { canCreate, canRead, canUpdate, canDelete } as const
	}),
	dependencies: [
		MessageRepo.Default,
		ChannelRepo.Default,
		OrganizationMemberRepo.Default,
		OrgResolver.Default,
	],
	accessors: true,
}) {}
