import {
	ChannelMemberRepo,
	ChannelRepo,
	MessageReactionRepo,
	MessageRepo,
	OrganizationMemberRepo,
} from "@hazel/backend-core"
import { ErrorUtils, type MessageId, type MessageReactionId, policy, withSystemActor } from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

export class MessageReactionPolicy extends Effect.Service<MessageReactionPolicy>()(
	"MessageReactionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "MessageReaction" as const

			const messageReactionRepo = yield* MessageReactionRepo
			const messageRepo = yield* MessageRepo
			const channelRepo = yield* ChannelRepo
			const channelMemberRepo = yield* ChannelMemberRepo
			const organizationMemberRepo = yield* OrganizationMemberRepo

			const canList = (_id: MessageId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					policy(
						policyEntity,
						"select",
						Effect.fn(`${policyEntity}.select`)(function* (_actor) {
							return yield* Effect.succeed(true)
						}),
					),
				)

			const canUpdate = (id: MessageReactionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					messageReactionRepo.with(id, (reaction) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								// Users can only update their own reactions
								return yield* Effect.succeed(actor.id === reaction.userId)
							}),
						),
					),
				)

			const canCreate = (messageId: MessageId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					messageRepo.with(messageId, (message) =>
						channelRepo.with(message.channelId, (channel) =>
							policy(
								policyEntity,
								"create",
								Effect.fn(`${policyEntity}.create`)(function* (actor) {
									// Check if user is a member of the organization
									const orgMember = yield* organizationMemberRepo
										.findByOrgAndUser(channel.organizationId, actor.id)
										.pipe(withSystemActor)

									// Handle based on channel type
									if (channel.type === "public") {
										// Org members can react in public channels
										return Option.isSome(orgMember)
									}

									if (channel.type === "private") {
										// Check if user is a channel member or org admin
										if (
											Option.isSome(orgMember) &&
											isAdminOrOwner(orgMember.value.role)
										) {
											return true
										}

										const channelMembership = yield* channelMemberRepo
											.findByChannelAndUser(message.channelId, actor.id)
											.pipe(withSystemActor)

										return Option.isSome(channelMembership)
									}

									if (channel.type === "direct" || channel.type === "single") {
										// Check if user is a channel member
										const channelMembership = yield* channelMemberRepo
											.findByChannelAndUser(message.channelId, actor.id)
											.pipe(withSystemActor)

										return Option.isSome(channelMembership)
									}

									if (channel.type === "thread") {
										// Threads inherit permissions from parent channel
										if (channel.parentChannelId) {
											const parentChannel = yield* channelRepo
												.findById(channel.parentChannelId)
												.pipe(withSystemActor)

											if (Option.isNone(parentChannel)) {
												return false
											}

											const parent = parentChannel.value

											if (parent.type === "public") {
												return Option.isSome(orgMember)
											}

											if (parent.type === "private") {
												if (
													Option.isSome(orgMember) &&
													isAdminOrOwner(orgMember.value.role)
												) {
													return true
												}

												const parentMembership = yield* channelMemberRepo
													.findByChannelAndUser(parent.id, actor.id)
													.pipe(withSystemActor)

												return Option.isSome(parentMembership)
											}

											if (parent.type === "direct" || parent.type === "single") {
												const parentMembership = yield* channelMemberRepo
													.findByChannelAndUser(parent.id, actor.id)
													.pipe(withSystemActor)

												return Option.isSome(parentMembership)
											}

											// Nested threads or unknown parent type - deny
											return false
										}
										// Thread without parent - deny
										return false
									}

									return false
								}),
							),
						),
					),
				)

			const canDelete = (id: MessageReactionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					messageReactionRepo.with(id, (reaction) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								// Users can only delete their own reactions
								return yield* Effect.succeed(actor.id === reaction.userId)
							}),
						),
					),
				)

			return { canCreate, canDelete, canUpdate, canList } as const
		}),
		dependencies: [
			MessageReactionRepo.Default,
			MessageRepo.Default,
			ChannelMemberRepo.Default,
			ChannelRepo.Default,
			OrganizationMemberRepo.Default,
		],
		accessors: true,
	},
) {}
