import {
	AttachmentRepo,
	ChannelMemberRepo,
	ChannelRepo,
	MessageRepo,
	OrganizationMemberRepo,
} from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { AttachmentId } from "@hazel/schema"
import { ServiceMap, Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

export class AttachmentPolicy extends ServiceMap.Service<AttachmentPolicy>()("AttachmentPolicy/Policy", {
	make: Effect.gen(function* () {
		const policyEntity = "Attachment" as const

		const attachmentRepo = yield* AttachmentRepo
		const messageRepo = yield* MessageRepo
		const channelRepo = yield* ChannelRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const channelMemberRepo = yield* ChannelMemberRepo
		const orgResolver = yield* OrgResolver

		const canCreate = () =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.create`)(function* (_actor) {
						return yield* Effect.succeed(true)
					}),
				),
			)

		const canUpdate = (id: AttachmentId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				attachmentRepo.with(id, (attachment) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							return yield* Effect.succeed(actor.id === attachment.uploadedBy)
						}),
					),
				),
			)

		const canDelete = (id: AttachmentId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				attachmentRepo.with(id, (attachment) => {
					if (!attachment.messageId) {
						return policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								return yield* Effect.succeed(actor.id === attachment.uploadedBy)
							}),
						)
					}

					return messageRepo.with(attachment.messageId, (message) =>
						channelRepo.with(message.channelId, (channel) =>
							policy(
								policyEntity,
								"delete",
								Effect.fn(`${policyEntity}.delete`)(function* (actor) {
									if (actor.id === attachment.uploadedBy) {
										return yield* Effect.succeed(true)
									}

									if (actor.id === message.authorId) {
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
					)
				}),
			)

		const canView = (id: AttachmentId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"view",
			)(
				attachmentRepo.with(id, (attachment) => {
					if (!attachment.messageId) {
						return policy(
							policyEntity,
							"view",
							Effect.fn(`${policyEntity}.view`)(function* (actor) {
								return yield* Effect.succeed(actor.id === attachment.uploadedBy)
							}),
						)
					}

					return messageRepo.with(attachment.messageId, (message) =>
						channelRepo.with(message.channelId, (channel) =>
							policy(
								policyEntity,
								"view",
								Effect.fn(`${policyEntity}.view`)(function* (actor) {
									if (channel.type === "public") {
										const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
											channel.organizationId,
											actor.id,
										)

										if (Option.isSome(orgMember)) {
											return yield* Effect.succeed(true)
										}
									}

									const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
										channel.organizationId,
										actor.id,
									)

									if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
										return yield* Effect.succeed(true)
									}

									const channelMembership = yield* channelMemberRepo.findByChannelAndUser(
										channel.id,
										actor.id,
									)

									if (Option.isSome(channelMembership)) {
										return yield* Effect.succeed(true)
									}

									return yield* Effect.succeed(false)
								}),
							),
						),
					)
				}),
			)

		return { canCreate, canUpdate, canDelete, canView } as const
	}),
	dependencies: [
		AttachmentRepo.Default,
		MessageRepo.Default,
		ChannelRepo.Default,
		OrganizationMemberRepo.Default,
		ChannelMemberRepo.Default,
		OrgResolver.Default,
	],
}) {}
