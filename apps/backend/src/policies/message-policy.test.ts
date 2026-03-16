import { describe, expect, it } from "@effect/vitest"
import { ChannelMemberRepo, ChannelRepo, MessageRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Result, Layer, Option } from "effect"
import { OrgResolver } from "../services/org-resolver.ts"
import { MessagePolicy } from "./message-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrganizationMemberRepoLayer,
	runWithActorEither,
	serviceShape,
	TEST_ORG_ID,
	TEST_USER_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const CHANNEL_ID = "00000000-0000-4000-8000-000000000801" as ChannelId
const MESSAGE_ID = "00000000-0000-4000-8000-000000000802" as MessageId
const MISSING_MESSAGE_ID = "00000000-0000-4000-8000-000000000899" as MessageId

/**
 * Creates a ChannelRepo mock with both `findById` (for OrgResolver) and `with` (for MessagePolicy).
 */
const makeChannelRepoLayer = (
	channels: Record<string, { organizationId: OrganizationId; type: string; id: ChannelId }>,
) =>
	Layer.succeed(
		ChannelRepo,
		serviceShape<typeof ChannelRepo>({
			findById: (id: ChannelId) => {
				const channel = channels[id]
				return Effect.succeed(channel ? Option.some(channel) : Option.none())
			},
			with: <A, E, R>(
				id: ChannelId,
				f: (channel: {
					organizationId: OrganizationId
					type: string
					id: ChannelId
				}) => Effect.Effect<A, E, R>,
			) => {
				const channel = channels[id]
				if (!channel) {
					return Effect.fail(makeEntityNotFound("Channel"))
				}
				return f(channel)
			},
		}),
	)

/**
 * Creates a MessageRepo mock with a `with` method.
 */
const makeMessageRepoLayer = (messages: Record<string, { authorId: UserId; channelId: ChannelId }>) =>
	Layer.succeed(
		MessageRepo,
		serviceShape<typeof MessageRepo>({
			findById: (id: MessageId) => {
				const message = messages[id]
				return Effect.succeed(message ? Option.some(message) : Option.none())
			},
			with: <A, E, R>(
				id: MessageId,
				f: (message: { authorId: UserId; channelId: ChannelId }) => Effect.Effect<A, E, R>,
			) => {
				const message = messages[id]
				if (!message) {
					return Effect.fail(makeEntityNotFound("Message"))
				}
				return f(message)
			},
		}),
	)

const emptyChannelMemberRepoLayer = Layer.succeed(
	ChannelMemberRepo,
	serviceShape<typeof ChannelMemberRepo>({
		findByChannelAndUser: (_channelId: ChannelId, _userId: UserId) => Effect.succeed(Option.none()),
	}),
)

/**
 * Builds the full layer stack for MessagePolicy tests.
 * ChannelRepo is shared between OrgResolver (findById) and MessagePolicy (with).
 */
const makePolicyLayer = (
	members: Record<string, Role>,
	messages: Record<string, { authorId: UserId; channelId: ChannelId }>,
	channels: Record<string, { organizationId: OrganizationId; type: string; id: ChannelId }>,
) => {
	const channelRepoLayer = makeChannelRepoLayer(channels)
	const messageRepoLayer = makeMessageRepoLayer(messages)
	const orgMemberRepoLayer = makeOrganizationMemberRepoLayer(members)

	const orgResolverLayer = Layer.effect(OrgResolver, OrgResolver.make).pipe(
		Layer.provide(orgMemberRepoLayer),
		Layer.provide(channelRepoLayer),
		Layer.provide(emptyChannelMemberRepoLayer),
		Layer.provide(messageRepoLayer),
	)

	return Layer.effect(MessagePolicy, MessagePolicy.make).pipe(
		Layer.provide(orgResolverLayer),
		Layer.provide(messageRepoLayer),
		Layer.provide(channelRepoLayer),
		Layer.provide(orgMemberRepoLayer),
	)
}

describe("MessagePolicy", () => {
	it("canCreate allows org member with public channel access", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canCreate(CHANNEL_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canCreate denies non-org-member", async () => {
		const actor = makeActor({
			id: "00000000-0000-4000-8000-000000000199" as UserId,
		})
		const layer = makePolicyLayer(
			{},
			{},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canCreate(CHANNEL_ID)),
			layer,
			actor,
		)
		expect(Result.isFailure(result)).toBe(true)
	})

	it("canRead allows org member with channel access", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canRead(CHANNEL_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canUpdate allows message author", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{
				[MESSAGE_ID]: { authorId: actor.id, channelId: CHANNEL_ID },
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canUpdate(MESSAGE_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canUpdate denies non-author", async () => {
		const otherUser = makeActor({
			id: "00000000-0000-4000-8000-000000000199" as UserId,
		})
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${otherUser.id}`]: "member",
			},
			{
				[MESSAGE_ID]: { authorId: TEST_USER_ID, channelId: CHANNEL_ID },
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canUpdate(MESSAGE_ID)),
			layer,
			otherUser,
		)
		expect(Result.isFailure(result)).toBe(true)
	})

	it("canDelete allows message author", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{
				[MESSAGE_ID]: { authorId: actor.id, channelId: CHANNEL_ID },
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canDelete(MESSAGE_ID)),
			layer,
			actor,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canDelete allows org admin who is not author", async () => {
		const admin = makeActor({
			id: "00000000-0000-4000-8000-000000000199" as UserId,
		})
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${admin.id}`]: "admin",
			},
			{
				[MESSAGE_ID]: { authorId: TEST_USER_ID, channelId: CHANNEL_ID },
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canDelete(MESSAGE_ID)),
			layer,
			admin,
		)
		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canDelete denies org member who is not author and not admin", async () => {
		const member = makeActor({
			id: "00000000-0000-4000-8000-000000000199" as UserId,
		})
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${member.id}`]: "member",
			},
			{
				[MESSAGE_ID]: { authorId: TEST_USER_ID, channelId: CHANNEL_ID },
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canDelete(MESSAGE_ID)),
			layer,
			member,
		)
		expect(Result.isFailure(result)).toBe(true)
	})

	it("canDelete maps missing message to UnauthorizedError", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		)

		const result = await runWithActorEither(
			MessagePolicy.use((policy) => policy.canDelete(MISSING_MESSAGE_ID)),
			layer,
			actor,
		)
		expect(Result.isFailure(result)).toBe(true)
		if (Result.isFailure(result)) {
			expect(UnauthorizedError.is(result.failure)).toBe(true)
		}
	})
})
