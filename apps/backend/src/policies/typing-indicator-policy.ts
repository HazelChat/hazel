import { ChannelMemberRepo, TypingIndicatorRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { makePolicy, withPolicyUnauthorized } from "../lib/policy-utils"

export class TypingIndicatorPolicy extends Effect.Service<TypingIndicatorPolicy>()(
	"TypingIndicatorPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "TypingIndicator" as const
			const authorize = makePolicy(policyEntity)

			const channelMemberRepo = yield* ChannelMemberRepo
			const typingIndicatorRepo = yield* TypingIndicatorRepo

			const canRead = (_id: TypingIndicatorId) => authorize("select", () => Effect.succeed(true))

			const canCreate = (channelId: ChannelId) =>
				authorize("create", (actor) =>
					channelMemberRepo
						.findByChannelAndUser(channelId, actor.id)
						.pipe(withSystemActor, Effect.map(Option.isSome)),
				)

			const canUpdate = (id: TypingIndicatorId) =>
				withPolicyUnauthorized(
					policyEntity,
					"update",
					typingIndicatorRepo.with(id, (indicator) =>
						channelMemberRepo.with(indicator.memberId, (member) =>
							// User can only update their own typing indicator
							authorize("update", (actor) => Effect.succeed(actor.id === member.userId)),
						),
					),
				)

			const canDelete = (data: { memberId: ChannelMemberId } | { id: TypingIndicatorId }) =>
				withPolicyUnauthorized(
					policyEntity,
					"delete",
					"memberId" in data
						? channelMemberRepo.with(data.memberId, (member) =>
								authorize("delete", (actor) => Effect.succeed(member.userId === actor.id)),
							)
						: typingIndicatorRepo.with(data.id, (indicator) =>
								channelMemberRepo.with(indicator.memberId, (member) =>
									authorize("delete", (actor) =>
										Effect.succeed(member.userId === actor.id),
									),
								),
							),
				)

			return { canCreate, canUpdate, canDelete, canRead } as const
		}),
		dependencies: [ChannelMemberRepo.Default, TypingIndicatorRepo.Default],
		accessors: true,
	},
) {}
