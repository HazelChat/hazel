import { describe, expect, it } from "@effect/vitest"
import {
	ChannelRepo,
	ConnectConversationChannelRepo,
	ConnectConversationRepo,
	ConnectParticipantRepo,
	MessageReactionRepo,
	MessageRepo,
} from "@hazel/backend-core"
import { Database } from "@hazel/db"
import type {
	ChannelId,
	ConnectConversationChannelId,
	ConnectConversationId,
	ConnectParticipantId,
	OrganizationId,
	UserId,
} from "@hazel/schema"
import { Effect, Layer, Option } from "effect"
import { ChannelAccessSyncService } from "./channel-access-sync"
import { ConnectConversationService } from "./connect-conversation-service"
import { OrgResolver } from "./org-resolver"

const HOST_ORG_ID = "00000000-0000-0000-0000-000000000101" as OrganizationId
const GUEST_ORG_ID = "00000000-0000-0000-0000-000000000102" as OrganizationId
const OTHER_GUEST_ORG_ID = "00000000-0000-0000-0000-000000000103" as OrganizationId
const CONVERSATION_ID = "00000000-0000-0000-0000-000000000201" as ConnectConversationId
const HOST_CHANNEL_ID = "00000000-0000-0000-0000-000000000301" as ChannelId
const GUEST_CHANNEL_ID = "00000000-0000-0000-0000-000000000302" as ChannelId
const OTHER_GUEST_CHANNEL_ID = "00000000-0000-0000-0000-000000000303" as ChannelId
const HOST_USER_ID = "00000000-0000-0000-0000-000000000401" as UserId
const GUEST_USER_ID = "00000000-0000-0000-0000-000000000402" as UserId

type MutableConversation = {
	id: ConnectConversationId
	hostOrganizationId: OrganizationId
	hostChannelId: ChannelId
	status: "active" | "disconnected"
	settings: Record<string, unknown> | null
	createdBy: UserId
	createdAt: Date
	updatedAt: Date | null
	deletedAt: Date | null
}

type MutableMount = {
	id: ConnectConversationChannelId
	conversationId: ConnectConversationId
	organizationId: OrganizationId
	channelId: ChannelId
	role: "host" | "guest"
	allowGuestMemberAdds: boolean
	isActive: boolean
	createdAt: Date
	updatedAt: Date | null
	deletedAt: Date | null
}

type MutableParticipant = {
	id: ConnectParticipantId
	conversationId: ConnectConversationId
	channelId: ChannelId
	userId: UserId
	homeOrganizationId: OrganizationId
	isExternal: boolean
	addedBy: UserId | null
	createdAt: Date
	updatedAt: Date | null
	deletedAt: Date | null
}

const makeChannelRepoLayer = () =>
	Layer.succeed(ChannelRepo, {
		findById: () => Effect.succeed(Option.none()),
	} as unknown as ChannelRepo)

const makeMessageRepoLayer = () =>
	Layer.succeed(MessageRepo, {
		backfillConversationIdForChannel: () => Effect.succeed(undefined),
	} as unknown as MessageRepo)

const makeMessageReactionRepoLayer = () =>
	Layer.succeed(MessageReactionRepo, {
		backfillConversationIdForChannel: () => Effect.succeed(undefined),
	} as unknown as MessageReactionRepo)

const makeOrgResolverLayer = () =>
	Layer.succeed(OrgResolver, {
		fromChannelWithAccess: () => Effect.succeed(undefined),
	} as unknown as OrgResolver)

const makeConversationRepoLayer = (conversation: MutableConversation) =>
	Layer.succeed(ConnectConversationRepo, {
		findById: (id: ConnectConversationId) =>
			Effect.succeed(id === conversation.id ? Option.some(conversation) : Option.none()),
		update: (patch: Partial<MutableConversation> & { id: ConnectConversationId }) =>
			Effect.sync(() => {
				Object.assign(conversation, patch)
				return conversation
			}),
		insert: () => Effect.die("not implemented"),
	} as unknown as ConnectConversationRepo)

const makeMountRepoLayer = (mounts: MutableMount[]) =>
	Layer.succeed(ConnectConversationChannelRepo, {
		findByChannelId: (channelId: ChannelId) =>
			Effect.succeed(
				Option.fromNullable(
					mounts.find((mount) => mount.channelId === channelId && mount.deletedAt === null),
				),
			),
		findByConversationId: (conversationId: ConnectConversationId) =>
			Effect.succeed(
				mounts.filter((mount) => mount.conversationId === conversationId && mount.deletedAt === null),
			),
		update: (patch: Partial<MutableMount> & { id: ConnectConversationChannelId }) =>
			Effect.sync(() => {
				const mount = mounts.find((candidate) => candidate.id === patch.id)
				if (!mount) throw new Error(`Missing mount ${patch.id}`)
				Object.assign(mount, patch)
				return mount
			}),
		insert: () => Effect.die("not implemented"),
	} as unknown as ConnectConversationChannelRepo)

const makeParticipantRepoLayer = (participants: MutableParticipant[]) =>
	Layer.succeed(ConnectParticipantRepo, {
		listByConversation: (conversationId: ConnectConversationId) =>
			Effect.succeed(
				participants.filter(
					(participant) =>
						participant.conversationId === conversationId && participant.deletedAt === null,
				),
			),
		update: (patch: Partial<MutableParticipant> & { id: ConnectParticipantId }) =>
			Effect.sync(() => {
				const participant = participants.find((candidate) => candidate.id === patch.id)
				if (!participant) throw new Error(`Missing participant ${patch.id}`)
				Object.assign(participant, patch)
				return participant
			}),
		findByChannelAndUser: () => Effect.succeed(Option.none()),
		insert: () => Effect.die("not implemented"),
		upsertByChannelAndUser: () => Effect.die("not implemented"),
	} as unknown as ConnectParticipantRepo)

const makeChannelAccessSyncLayer = (syncedChannels: ChannelId[]) =>
	Layer.succeed(ChannelAccessSyncService, {
		syncChannel: (channelId: ChannelId) =>
			Effect.sync(() => {
				syncedChannels.push(channelId)
			}),
	} as unknown as ChannelAccessSyncService)

const makeServiceLayer = (params: {
	conversation: MutableConversation
	mounts: MutableMount[]
	participants: MutableParticipant[]
	syncedChannels: ChannelId[]
}) =>
	ConnectConversationService.DefaultWithoutDependencies.pipe(
		Layer.provide(makeChannelRepoLayer()),
		Layer.provide(makeConversationRepoLayer(params.conversation)),
		Layer.provide(makeMountRepoLayer(params.mounts)),
		Layer.provide(makeParticipantRepoLayer(params.participants)),
		Layer.provide(makeMessageRepoLayer()),
		Layer.provide(makeMessageReactionRepoLayer()),
		Layer.provide(makeChannelAccessSyncLayer(params.syncedChannels)),
		Layer.provide(makeOrgResolverLayer()),
	)

const useService = <A, E, R>(fn: (service: ConnectConversationService) => Effect.Effect<A, E, R>) =>
	Effect.gen(function* () {
		const service = yield* ConnectConversationService
		return yield* fn(service)
	})

describe("ConnectConversationService", () => {
	it("returns the existing mount when conversation creation races on unique constraints", async () => {
		const now = new Date("2026-03-13T12:00:00.000Z")
		const existingConversation: MutableConversation = {
			id: CONVERSATION_ID,
			hostOrganizationId: HOST_ORG_ID,
			hostChannelId: HOST_CHANNEL_ID,
			status: "active",
			settings: null,
			createdBy: HOST_USER_ID,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		}
		const existingMount: MutableMount = {
			id: "00000000-0000-0000-0000-000000000411" as ConnectConversationChannelId,
			conversationId: CONVERSATION_ID,
			organizationId: HOST_ORG_ID,
			channelId: HOST_CHANNEL_ID,
			role: "host",
			allowGuestMemberAdds: false,
			isActive: true,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		}
		const backfills: Array<{ kind: "message" | "reaction"; conversationId: ConnectConversationId }> = []
		let findByChannelCalls = 0

		const layer = ConnectConversationService.DefaultWithoutDependencies.pipe(
			Layer.provide(
				Layer.succeed(ChannelRepo, {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: HOST_CHANNEL_ID,
								organizationId: HOST_ORG_ID,
							}),
						),
				} as unknown as ChannelRepo),
			),
			Layer.provide(
				Layer.succeed(ConnectConversationRepo, {
					insert: () =>
						Effect.fail(
							new Database.DatabaseError({
								type: "unique_violation",
								cause: { constraint_name: "connect_conversations_host_channel_unique" },
							}),
						),
					findByHostChannel: () => Effect.succeed(Option.some(existingConversation)),
				} as unknown as ConnectConversationRepo),
			),
			Layer.provide(
				Layer.succeed(ConnectConversationChannelRepo, {
					findByChannelId: () =>
						Effect.sync(() => {
							findByChannelCalls += 1
							return findByChannelCalls === 1 ? Option.none() : Option.some(existingMount)
						}),
					insert: () =>
						Effect.fail(
							new Database.DatabaseError({
								type: "unique_violation",
								cause: { constraint_name: "connect_conv_channels_channel_unique" },
							}),
						),
					findByConversationId: () => Effect.succeed([existingMount]),
				} as unknown as ConnectConversationChannelRepo),
			),
			Layer.provide(makeParticipantRepoLayer([])),
			Layer.provide(
				Layer.succeed(MessageRepo, {
					backfillConversationIdForChannel: (
						_channelId: ChannelId,
						conversationId: ConnectConversationId,
					) =>
						Effect.sync(() => {
							backfills.push({ kind: "message", conversationId })
						}),
				} as unknown as MessageRepo),
			),
			Layer.provide(
				Layer.succeed(MessageReactionRepo, {
					backfillConversationIdForChannel: (
						_channelId: ChannelId,
						conversationId: ConnectConversationId,
					) =>
						Effect.sync(() => {
							backfills.push({ kind: "reaction", conversationId })
						}),
				} as unknown as MessageReactionRepo),
			),
			Layer.provide(makeChannelAccessSyncLayer([])),
			Layer.provide(makeOrgResolverLayer()),
		)

		const mount = await Effect.runPromise(
			useService((service) => service.ensureChannelConversation(HOST_CHANNEL_ID, HOST_USER_ID)).pipe(
				Effect.provide(layer),
				Effect.orDie,
			),
		)

		expect(mount).toEqual(existingMount)
		expect(backfills).toEqual([
			{ kind: "message", conversationId: CONVERSATION_ID },
			{ kind: "reaction", conversationId: CONVERSATION_ID },
		])
	})

	it("reuses the ambient transaction context during backfill", async () => {
		const now = new Date("2026-03-13T12:00:00.000Z")
		const transactionChecks: boolean[] = []

		const layer = ConnectConversationService.DefaultWithoutDependencies.pipe(
			Layer.provide(
				Layer.succeed(ChannelRepo, {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: HOST_CHANNEL_ID,
								organizationId: HOST_ORG_ID,
							}),
						),
				} as unknown as ChannelRepo),
			),
			Layer.provide(
				Layer.succeed(ConnectConversationRepo, {
					insert: () =>
						Effect.succeed([
							{
								id: CONVERSATION_ID,
								hostOrganizationId: HOST_ORG_ID,
								hostChannelId: HOST_CHANNEL_ID,
								status: "active",
								settings: null,
								createdBy: HOST_USER_ID,
								createdAt: now,
								updatedAt: now,
								deletedAt: null,
							},
						]),
				} as unknown as ConnectConversationRepo),
			),
			Layer.provide(
				Layer.succeed(ConnectConversationChannelRepo, {
					findByChannelId: () => Effect.succeed(Option.none()),
					insert: () =>
						Effect.succeed([
							{
								id: "00000000-0000-0000-0000-000000000412" as ConnectConversationChannelId,
								conversationId: CONVERSATION_ID,
								organizationId: HOST_ORG_ID,
								channelId: HOST_CHANNEL_ID,
								role: "host",
								allowGuestMemberAdds: false,
								isActive: true,
								createdAt: now,
								updatedAt: now,
								deletedAt: null,
							},
						]),
				} as unknown as ConnectConversationChannelRepo),
			),
			Layer.provide(makeParticipantRepoLayer([])),
			Layer.provide(
				Layer.succeed(MessageRepo, {
					backfillConversationIdForChannel: () =>
						Effect.serviceOption(Database.TransactionContext).pipe(
							Effect.tap((maybeTx) =>
								Effect.sync(() => {
									transactionChecks.push(Option.isSome(maybeTx))
								}),
							),
							Effect.as(undefined),
						),
				} as unknown as MessageRepo),
			),
			Layer.provide(
				Layer.succeed(MessageReactionRepo, {
					backfillConversationIdForChannel: () =>
						Effect.serviceOption(Database.TransactionContext).pipe(
							Effect.tap((maybeTx) =>
								Effect.sync(() => {
									transactionChecks.push(Option.isSome(maybeTx))
								}),
							),
							Effect.as(undefined),
						),
				} as unknown as MessageReactionRepo),
			),
			Layer.provide(makeChannelAccessSyncLayer([])),
			Layer.provide(makeOrgResolverLayer()),
		)

		await Effect.runPromise(
			useService((service) => service.ensureChannelConversation(HOST_CHANNEL_ID, HOST_USER_ID)).pipe(
				Effect.provide(layer),
				Effect.provideService(Database.TransactionContext, {
					execute: (fn) => Effect.promise(() => fn({} as never)),
				}),
				Effect.orDie,
			),
		)

		expect(transactionChecks).toEqual([true, true])
	})

	it("batches participant upserts across mounted channels", async () => {
		const now = new Date("2026-03-13T12:00:00.000Z")
		const upserts: Array<{
			channelId: ChannelId
			userId: UserId
			homeOrganizationId: OrganizationId
			isExternal: boolean
		}> = []
		let mountFetchCount = 0
		const mounts: MutableMount[] = [
			{
				id: "00000000-0000-0000-0000-000000000921" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: HOST_ORG_ID,
				channelId: HOST_CHANNEL_ID,
				role: "host",
				allowGuestMemberAdds: false,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000922" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: GUEST_ORG_ID,
				channelId: GUEST_CHANNEL_ID,
				role: "guest",
				allowGuestMemberAdds: true,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]

		const layer = ConnectConversationService.DefaultWithoutDependencies.pipe(
			Layer.provide(makeChannelRepoLayer()),
			Layer.provide(Layer.succeed(ConnectConversationRepo, {} as unknown as ConnectConversationRepo)),
			Layer.provide(
				Layer.succeed(ConnectConversationChannelRepo, {
					findByConversationId: () =>
						Effect.sync(() => {
							mountFetchCount += 1
							return mounts
						}),
				} as unknown as ConnectConversationChannelRepo),
			),
			Layer.provide(
				Layer.succeed(ConnectParticipantRepo, {
					upsertByChannelAndUser: (row: any) =>
						Effect.sync(() => {
							upserts.push(row)
							return row
						}),
				} as unknown as ConnectParticipantRepo),
			),
			Layer.provide(makeMessageRepoLayer()),
			Layer.provide(makeMessageReactionRepoLayer()),
			Layer.provide(makeChannelAccessSyncLayer([])),
			Layer.provide(makeOrgResolverLayer()),
		)

		await Effect.runPromise(
			useService((service) =>
				service.addParticipantsToConversation(
					CONVERSATION_ID,
					[
						{ userId: HOST_USER_ID, homeOrganizationId: HOST_ORG_ID },
						{ userId: GUEST_USER_ID, homeOrganizationId: GUEST_ORG_ID },
					],
					HOST_USER_ID,
				),
			).pipe(Effect.provide(layer), Effect.orDie),
		)

		expect(mountFetchCount).toBe(1)
		expect(upserts).toHaveLength(4)
		expect(upserts).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					channelId: HOST_CHANNEL_ID,
					userId: HOST_USER_ID,
					homeOrganizationId: HOST_ORG_ID,
					isExternal: false,
				}),
				expect.objectContaining({
					channelId: HOST_CHANNEL_ID,
					userId: GUEST_USER_ID,
					homeOrganizationId: GUEST_ORG_ID,
					isExternal: true,
				}),
				expect.objectContaining({
					channelId: GUEST_CHANNEL_ID,
					userId: HOST_USER_ID,
					homeOrganizationId: HOST_ORG_ID,
					isExternal: true,
				}),
				expect.objectContaining({
					channelId: GUEST_CHANNEL_ID,
					userId: GUEST_USER_ID,
					homeOrganizationId: GUEST_ORG_ID,
					isExternal: false,
				}),
			]),
		)
	})

	it("removes a participant from every mounted channel in the conversation", async () => {
		const now = new Date("2026-03-13T12:00:00.000Z")
		const syncedChannels: ChannelId[] = []
		const conversation: MutableConversation = {
			id: CONVERSATION_ID,
			hostOrganizationId: HOST_ORG_ID,
			hostChannelId: HOST_CHANNEL_ID,
			status: "active",
			settings: null,
			createdBy: HOST_USER_ID,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		}
		const mounts: MutableMount[] = [
			{
				id: "00000000-0000-0000-0000-000000000501" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: HOST_ORG_ID,
				channelId: HOST_CHANNEL_ID,
				role: "host",
				allowGuestMemberAdds: false,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000502" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: GUEST_ORG_ID,
				channelId: GUEST_CHANNEL_ID,
				role: "guest",
				allowGuestMemberAdds: true,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]
		const participants: MutableParticipant[] = [
			{
				id: "00000000-0000-0000-0000-000000000601" as ConnectParticipantId,
				conversationId: CONVERSATION_ID,
				channelId: HOST_CHANNEL_ID,
				userId: GUEST_USER_ID,
				homeOrganizationId: GUEST_ORG_ID,
				isExternal: true,
				addedBy: HOST_USER_ID,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000602" as ConnectParticipantId,
				conversationId: CONVERSATION_ID,
				channelId: GUEST_CHANNEL_ID,
				userId: GUEST_USER_ID,
				homeOrganizationId: GUEST_ORG_ID,
				isExternal: false,
				addedBy: HOST_USER_ID,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]

		await Effect.runPromise(
			useService((service) =>
				service.removeParticipantFromConversation(CONVERSATION_ID, GUEST_USER_ID),
			).pipe(
				Effect.provide(makeServiceLayer({ conversation, mounts, participants, syncedChannels })),
				Effect.orDie,
			) as Effect.Effect<void, never, never>,
		)

		expect(participants.every((participant) => participant.deletedAt instanceof Date)).toBe(true)
		expect(syncedChannels).toEqual([HOST_CHANNEL_ID, GUEST_CHANNEL_ID])
	})

	it("disconnects a guest organization and removes only that workspace's participant projections", async () => {
		const now = new Date("2026-03-13T12:00:00.000Z")
		const syncedChannels: ChannelId[] = []
		const conversation: MutableConversation = {
			id: CONVERSATION_ID,
			hostOrganizationId: HOST_ORG_ID,
			hostChannelId: HOST_CHANNEL_ID,
			status: "active",
			settings: null,
			createdBy: HOST_USER_ID,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		}
		const mounts: MutableMount[] = [
			{
				id: "00000000-0000-0000-0000-000000000701" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: HOST_ORG_ID,
				channelId: HOST_CHANNEL_ID,
				role: "host",
				allowGuestMemberAdds: false,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000702" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: GUEST_ORG_ID,
				channelId: GUEST_CHANNEL_ID,
				role: "guest",
				allowGuestMemberAdds: true,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000703" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: OTHER_GUEST_ORG_ID,
				channelId: OTHER_GUEST_CHANNEL_ID,
				role: "guest",
				allowGuestMemberAdds: true,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]
		const participants: MutableParticipant[] = [
			{
				id: "00000000-0000-0000-0000-000000000801" as ConnectParticipantId,
				conversationId: CONVERSATION_ID,
				channelId: HOST_CHANNEL_ID,
				userId: GUEST_USER_ID,
				homeOrganizationId: GUEST_ORG_ID,
				isExternal: true,
				addedBy: HOST_USER_ID,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000802" as ConnectParticipantId,
				conversationId: CONVERSATION_ID,
				channelId: OTHER_GUEST_CHANNEL_ID,
				userId: HOST_USER_ID,
				homeOrganizationId: HOST_ORG_ID,
				isExternal: true,
				addedBy: HOST_USER_ID,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]

		await Effect.runPromise(
			useService((service) => service.disconnectOrganization(CONVERSATION_ID, GUEST_ORG_ID)).pipe(
				Effect.provide(makeServiceLayer({ conversation, mounts, participants, syncedChannels })),
				Effect.orDie,
			) as Effect.Effect<void, never, never>,
		)

		expect(mounts[1]?.deletedAt instanceof Date).toBe(true)
		expect(mounts[0]?.deletedAt).toBeNull()
		expect(mounts[2]?.deletedAt).toBeNull()
		expect(participants[0]?.deletedAt instanceof Date).toBe(true)
		expect(participants[1]?.deletedAt).toBeNull()
		expect(conversation.deletedAt).toBeNull()
		expect(conversation.status).toBe("active")
		expect(syncedChannels).toEqual([HOST_CHANNEL_ID, GUEST_CHANNEL_ID, OTHER_GUEST_CHANNEL_ID])
	})

	it("disconnects the host organization by retiring the whole conversation", async () => {
		const now = new Date("2026-03-13T12:00:00.000Z")
		const syncedChannels: ChannelId[] = []
		const conversation: MutableConversation = {
			id: CONVERSATION_ID,
			hostOrganizationId: HOST_ORG_ID,
			hostChannelId: HOST_CHANNEL_ID,
			status: "active",
			settings: null,
			createdBy: HOST_USER_ID,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		}
		const mounts: MutableMount[] = [
			{
				id: "00000000-0000-0000-0000-000000000901" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: HOST_ORG_ID,
				channelId: HOST_CHANNEL_ID,
				role: "host",
				allowGuestMemberAdds: false,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000000902" as ConnectConversationChannelId,
				conversationId: CONVERSATION_ID,
				organizationId: GUEST_ORG_ID,
				channelId: GUEST_CHANNEL_ID,
				role: "guest",
				allowGuestMemberAdds: true,
				isActive: true,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]
		const participants: MutableParticipant[] = [
			{
				id: "00000000-0000-0000-0000-000000001001" as ConnectParticipantId,
				conversationId: CONVERSATION_ID,
				channelId: HOST_CHANNEL_ID,
				userId: HOST_USER_ID,
				homeOrganizationId: HOST_ORG_ID,
				isExternal: false,
				addedBy: HOST_USER_ID,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
			{
				id: "00000000-0000-0000-0000-000000001002" as ConnectParticipantId,
				conversationId: CONVERSATION_ID,
				channelId: GUEST_CHANNEL_ID,
				userId: GUEST_USER_ID,
				homeOrganizationId: GUEST_ORG_ID,
				isExternal: false,
				addedBy: HOST_USER_ID,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
			},
		]

		await Effect.runPromise(
			useService((service) => service.disconnectOrganization(CONVERSATION_ID, HOST_ORG_ID)).pipe(
				Effect.provide(makeServiceLayer({ conversation, mounts, participants, syncedChannels })),
				Effect.orDie,
			) as Effect.Effect<void, never, never>,
		)

		expect(mounts.every((mount) => mount.deletedAt instanceof Date && mount.isActive === false)).toBe(
			true,
		)
		expect(participants.every((participant) => participant.deletedAt instanceof Date)).toBe(true)
		expect(conversation.status).toBe("disconnected")
		expect(conversation.deletedAt instanceof Date).toBe(true)
		expect(syncedChannels).toEqual([HOST_CHANNEL_ID, GUEST_CHANNEL_ID])
	})
})
