import { MessageReactionRepo, MessageRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { MessageId, MessageReactionId } from "@hazel/schema"
import { Effect } from "effect"
import { withAnnotatedScope } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

export class MessageReactionPolicy extends Effect.Service<MessageReactionPolicy>()(
	"MessageReactionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "MessageReaction" as const

			const messageReactionRepo = yield* MessageReactionRepo
			const messageRepo = yield* MessageRepo
			const orgResolver = yield* OrgResolver

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
						withAnnotatedScope((scope) =>
							orgResolver.fromChannelWithAccess(
								message.channelId,
								scope,
								policyEntity,
								"create",
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
								return yield* Effect.succeed(actor.id === reaction.userId)
							}),
						),
					),
				)

			return { canCreate, canDelete, canUpdate, canList } as const
		}),
		dependencies: [MessageReactionRepo.Default, MessageRepo.Default, OrgResolver.Default],
		accessors: true,
	},
) {}
