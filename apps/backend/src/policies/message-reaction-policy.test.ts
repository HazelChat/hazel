import { describe, expect, it } from "@effect/vitest"
import { ChannelRepo, MessageReactionRepo, MessageRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { ChannelId, MessageId, MessageReactionId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { MessageReactionPolicy } from "./message-reaction-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrgResolverLayer,
	runWithActorEither,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const CHANNEL_ID = "00000000-0000-0000-0000-000000000871" as ChannelId
const MESSAGE_ID = "00000000-0000-0000-0000-000000000872" as MessageId
const REACTION_ID = "00000000-0000-0000-0000-000000000873" as MessageReactionId
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000874" as UserId

type ReactionData = { userId: UserId }
type MessageData = { channelId: ChannelId }
type ChannelData = { organizationId: OrganizationId; type: string; id: string }

const makeReactionRepoLayer = (reactions: Record<string, ReactionData>) =>
	Layer.succeed(MessageReactionRepo, {
		with: <A, E, R>(
			id: MessageReactionId,
			f: (r: ReactionData) => Effect.Effect<A, E, R>,
		) => {
			const reaction = reactions[id]
			if (!reaction) return Effect.fail(makeEntityNotFound("MessageReaction"))
			return f(reaction)
		},
	} as unknown as MessageReactionRepo)

const makeMessageRepoLayer = (messages: Record<string, MessageData>) =>
	Layer.succeed(MessageRepo, {
		with: <A, E, R>(id: MessageId, f: (m: MessageData) => Effect.Effect<A, E, R>) => {
			const message = messages[id]
			if (!message) return Effect.fail(makeEntityNotFound("Message"))
			return f(message)
		},
		findById: (id: MessageId) => {
			const message = messages[id]
			return Effect.succeed(message ? Option.some(message) : Option.none())
		},
	} as unknown as MessageRepo)

const makeChannelRepoLayer = (channels: Record<string, ChannelData>) =>
	Layer.succeed(ChannelRepo, {
		findById: (id: ChannelId) => {
			const channel = channels[id]
			return Effect.succeed(channel ? Option.some(channel) : Option.none())
		},
	} as unknown as ChannelRepo)

const makePolicyLayer = (
	orgMembers: Record<string, Role>,
	reactions: Record<string, ReactionData>,
	messages: Record<string, MessageData>,
	channels: Record<string, ChannelData>,
) => {
	const channelRepoLayer = makeChannelRepoLayer(channels)
	const messageRepoLayer = makeMessageRepoLayer(messages)
	const orgMemberRepoLayer = Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = orgMembers[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

	const orgResolverLayer = makeOrgResolverLayer(orgMembers)

	return MessageReactionPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeReactionRepoLayer(reactions)),
		Layer.provide(messageRepoLayer),
		Layer.provide(orgResolverLayer),
	)
}

describe("MessageReactionPolicy", () => {
	it("canList allows any authenticated user", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, {}, {}, {})

		const result = await runWithActorEither(
			MessageReactionPolicy.canList(MESSAGE_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
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
			MessageReactionPolicy.canCreate(MESSAGE_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
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
			MessageReactionPolicy.canCreate(MESSAGE_ID),
			layer,
			outsider,
		)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canUpdate allows reaction owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{ [REACTION_ID]: { userId: actor.id } },
			{},
			{},
		)

		const result = await runWithActorEither(
			MessageReactionPolicy.canUpdate(REACTION_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate denies non-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{ [REACTION_ID]: { userId: OTHER_USER_ID } },
			{},
			{},
		)

		const result = await runWithActorEither(
			MessageReactionPolicy.canUpdate(REACTION_ID),
			layer,
			actor,
		)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canDelete allows reaction owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{ [REACTION_ID]: { userId: actor.id } },
			{},
			{},
		)

		const result = await runWithActorEither(
			MessageReactionPolicy.canDelete(REACTION_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete denies non-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{ [REACTION_ID]: { userId: OTHER_USER_ID } },
			{},
			{},
		)

		const result = await runWithActorEither(
			MessageReactionPolicy.canDelete(REACTION_ID),
			layer,
			actor,
		)
		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(UnauthorizedError.is(result.left)).toBe(true)
		}
	})
})
