import { type ChannelId, type DirectMessageParticipantId, policy, UnauthorizedError } from "@hazel/effect-lib"
import { Effect, Option } from "effect"
import { ChannelRepo } from "../repositories/channel-repo"
import { DirectMessageParticipantRepo } from "../repositories/direct-message-participant-repo"

export class DirectMessageParticipantPolicy extends Effect.Service<DirectMessageParticipantPolicy>()(
	"DirectMessageParticipantPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "DirectMessageParticipant" as const

			const directMessageParticipantRepo = yield* DirectMessageParticipantRepo
			const channelRepo = yield* ChannelRepo

			const canCreate = (channelId: ChannelId) =>
				UnauthorizedError.refail(
					policyEntity,
					"create",
				)(
					channelRepo.with(channelId, (channel) =>
						policy(
							policyEntity,
							"create",
							Effect.fn(`${policyEntity}.create`)(function* (_actor) {
								// Only allow creating participants for direct/single type channels
								if (channel.type !== "direct" && channel.type !== "single") {
									return yield* Effect.succeed(false)
								}

								// For direct messages, validation would need to be done at a higher level
								// For now, we'll allow if the channel is direct/single type
								return yield* Effect.succeed(true)
							}),
						),
					),
				)

			const canUpdate = (id: DirectMessageParticipantId) =>
				UnauthorizedError.refail(
					policyEntity,
					"update",
				)(
					directMessageParticipantRepo.with(id, (participant) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								// Users can only update their own participant settings (muted, hidden, etc.)
								return yield* Effect.succeed(actor.id === participant.userId)
							}),
						),
					),
				)

			const canDelete = (id: DirectMessageParticipantId) =>
				UnauthorizedError.refail(
					policyEntity,
					"delete",
				)(
					directMessageParticipantRepo.with(id, (participant) =>
						channelRepo.with(participant.channelId, (channel) =>
							policy(
								policyEntity,
								"delete",
								Effect.fn(`${policyEntity}.delete`)(function* (actor) {
									// Users can leave direct message conversations
									if (actor.id === participant.userId) {
										// For single (self) channels, prevent deletion
										if (channel.type === "single") {
											return yield* Effect.succeed(false)
										}
										return yield* Effect.succeed(true)
									}

									return yield* Effect.succeed(false)
								}),
							),
						),
					),
				)

			return { canCreate, canUpdate, canDelete } as const
		}),
		dependencies: [DirectMessageParticipantRepo.Default, ChannelRepo.Default],
		accessors: true,
	},
) {}
