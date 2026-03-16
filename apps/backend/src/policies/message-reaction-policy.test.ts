import { describe, expect, it } from "@effect/vitest"
import {
	ChannelMemberRepo,
	ChannelRepo,
	MessageReactionRepo,
	MessageRepo,
	OrganizationMemberRepo,
} from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type {
	ChannelId,
	ChannelMemberId,
	MessageId,
	MessageReactionId,
	OrganizationId,
	UserId,
} from "@hazel/schema"
import { Effect, Result, Layer, Option } from "effect"
import { MessageReactionPolicy } from "./message-reaction-policy.ts"
import { ConnectConversationService } from "../services/connect-conversation-service.ts"
import { OrgResolver } from "../services/org-resolver.ts"
import {
	makeActor,
	makeEntityNotFound,
	runWithActorEither,
	serviceShape,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const CHANNEL_ID = "00000000-0000-4000-8000-000000000871" as ChannelId
const MESSAGE_ID = "00000000-0000-4000-8000-000000000872" as MessageId
const REACTION_ID = "00000000-0000-4000-8000-000000000873" as MessageReactionId
const OTHER_USER_ID = "00000000-0000-4000-8000-000000000874" as UserId

type ReactionData = { userId: UserId }
type MessageData = { channelId: ChannelId }
type ChannelData = { organizationId: OrganizationId; type: string; id: string }

const makeReactionRepoLayer = (reactions: Record<string, ReactionData>) =>
	Layer.succeed(
		MessageReactionRepo,
		serviceShape<typeof MessageReactionRepo>({
			with: <A, E, R>(id: MessageReactionId, f: (r: ReactionData) => Effect.Effect<A, E, R>) => {
				const reaction = reactions[id]
				if (!reaction) return Effect.fail(makeEntityNotFound("MessageReaction"))
				return f(reaction)
			},
		}),
	)

const makeMessageRepoLayer = (messages: Record<string, MessageData>) =>
	Layer.succeed(
		MessageRepo,
		serviceShape<typeof MessageRepo>({
			with: <A, E, R>(id: MessageId, f: (m: MessageData) => Effect.Effect<A, E, R>) => {
				const message = messages[id]
				if (!message) return Effect.fail(makeEntityNotFound("Message"))
				return f(message)
			},
			findById: (id: MessageId) => {
				const message = messages[id]
				return Effect.succeed(message ? Option.some(message) : Option.none())
			},
		}),
	)

const makeChannelRepoLayer = (channels: Record<string, ChannelData>) =>
	Layer.succeed(
		ChannelRepo,
		serviceShape<typeof ChannelRepo>({
			findById: (id: ChannelId) => {
				const channel = channels[id]
				return Effect.succeed(channel ? Option.some(channel) : Option.none())
			},
		}),
	)

const makeOrgMemberRepoLayer = (orgMembers: Record<string, Role>) =>
	Layer.succeed(
		OrganizationMemberRepo,
		serviceShape<typeof OrganizationMemberRepo>({
			findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
				const role = orgMembers[`${organizationId}:${userId}`]
				return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
			},
		}),
	)

const emptyChannelMemberRepoLayer = Layer.succeed(
	ChannelMemberRepo,
	serviceShape<typeof ChannelMemberRepo>({
		findByChannelAndUser: (_channelId: ChannelId, _userId: UserId) => Effect.succeed(Option.none()),
	}),
)

const emptyMessageRepoLayer = Layer.succeed(
	MessageRepo,
	serviceShape<typeof MessageRepo>({
		findById: (_id: MessageId) => Effect.succeed(Option.none()),
	}),
)

const connectConversationServiceLayer = Layer.succeed(
	ConnectConversationService,
	serviceShape<typeof ConnectConversationService>({
		canAccessConversation: () => Effect.succeed(false),
	}),
)

const makePolicyLayer = (
	orgMembers: Record<string, Role>,
	reactions: Record<string, ReactionData>,
	messages: Record<string, MessageData>,
	channels: Record<string, ChannelData>,
) => {
	const channelRepoLayer = makeChannelRepoLayer(channels)
	const messageRepoLayer = makeMessageRepoLayer(messages)
	const orgMemberRepoLayer = makeOrgMemberRepoLayer(orgMembers)

	// Build OrgResolver with actual channel data (not empty stubs)
	const orgResolverLayer = Layer.effect(OrgResolver, OrgResolver.make).pipe(
		Layer.provide(orgMemberRepoLayer),
		Layer.provide(channelRepoLayer),
		Layer.provide(emptyChannelMemberRepoLayer),
		Layer.provide(emptyMessageRepoLayer),
	)

	return Layer.effect(MessageReactionPolicy, MessageReactionPolicy.make).pipe(
		Layer.provide(makeReactionRepoLayer(reactions)),
		Layer.provide(messageRepoLayer),
		Layer.provide(orgResolverLayer),
		Layer.provide(connectConversationServiceLayer),
	)
}

describe("MessageReactionPolicy", () => {
	it("canList allows any authenticated user", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, {}, {}, {})

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canList(MESSAGE_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canCreate allows org member with channel access", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			{},
			{ [MESSAGE_ID]: { channelId: CHANNEL_ID } },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
		)

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canCreate(MESSAGE_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canCreate denies non-org-member", async () => {
		const outsider = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer(
			{},
			{},
			{ [MESSAGE_ID]: { channelId: CHANNEL_ID } },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
		)

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canCreate(MESSAGE_ID)),
			layer,
			outsider,
		)
		expect(Result.isFailure(result)).toBe(true)
	})

	it("canUpdate allows reaction owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, { [REACTION_ID]: { userId: actor.id } }, {}, {})

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canUpdate(REACTION_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canUpdate denies non-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, { [REACTION_ID]: { userId: OTHER_USER_ID } }, {}, {})

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canUpdate(REACTION_ID)),
			layer,
			actor,
		)
		expect(Result.isFailure(result)).toBe(true)
	})

	it("canDelete allows reaction owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, { [REACTION_ID]: { userId: actor.id } }, {}, {})

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canDelete(REACTION_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canDelete denies non-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, { [REACTION_ID]: { userId: OTHER_USER_ID } }, {}, {})

		const result = await runWithActorEither(
			MessageReactionPolicy.use((policy) => policy.canDelete(REACTION_ID)),
			layer,
			actor,
		)
		expect(Result.isFailure(result)).toBe(true)
		if (Result.isFailure(result)) {
			expect(UnauthorizedError.is(result.failure)).toBe(true)
		}
	})
})
