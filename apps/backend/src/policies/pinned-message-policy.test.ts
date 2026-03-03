import { describe, expect, it } from "@effect/vitest"
import { ChannelRepo, OrganizationMemberRepo, PinnedMessageRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { ChannelId, OrganizationId, PinnedMessageId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { PinnedMessagePolicy } from "./pinned-message-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrgResolverLayer,
	runWithActorEither,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const CHANNEL_ID = "00000000-0000-0000-0000-000000000861" as ChannelId
const PINNED_MSG_ID = "00000000-0000-0000-0000-000000000862" as PinnedMessageId
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000863" as UserId
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000864" as UserId

type ChannelData = { organizationId: OrganizationId; type: string; id: string }
type PinnedData = { pinnedBy: UserId; channelId: ChannelId }

const makePinnedMessageRepoLayer = (pinnedMessages: Record<string, PinnedData>) =>
	Layer.succeed(PinnedMessageRepo, {
		with: <A, E, R>(id: PinnedMessageId, f: (pm: PinnedData) => Effect.Effect<A, E, R>) => {
			const pm = pinnedMessages[id]
			if (!pm) return Effect.fail(makeEntityNotFound("PinnedMessage"))
			return f(pm)
		},
	} as unknown as PinnedMessageRepo)

const makeChannelRepoLayer = (channels: Record<string, ChannelData>) =>
	Layer.succeed(ChannelRepo, {
		with: <A, E, R>(id: ChannelId, f: (ch: ChannelData) => Effect.Effect<A, E, R>) => {
			const ch = channels[id]
			if (!ch) return Effect.fail(makeEntityNotFound("Channel"))
			return f(ch)
		},
	} as unknown as ChannelRepo)

const makeOrgMemberRepoLayer = (orgMembers: Record<string, Role>) =>
	Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = orgMembers[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makePolicyLayer = (
	orgMembers: Record<string, Role>,
	channels: Record<string, ChannelData>,
	pinnedMessages: Record<string, PinnedData>,
) =>
	PinnedMessagePolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makePinnedMessageRepoLayer(pinnedMessages)),
		Layer.provide(makeChannelRepoLayer(channels)),
		Layer.provide(makeOrgMemberRepoLayer(orgMembers)),
		Layer.provide(makeOrgResolverLayer(orgMembers)),
	)

describe("PinnedMessagePolicy", () => {
	it("canCreate allows admin-or-owner for any channel type", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID } },
			{},
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canCreate(CHANNEL_ID), layer, admin)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canCreate allows member in public channel", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{},
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canCreate(CHANNEL_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canCreate denies member in private channel", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID } },
			{},
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canCreate(CHANNEL_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canCreate denies non-org-member", async () => {
		const outsider = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer(
			{},
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{},
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canCreate(CHANNEL_ID), layer, outsider)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canUpdate allows pinner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{ [PINNED_MSG_ID]: { pinnedBy: actor.id, channelId: CHANNEL_ID } },
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canUpdate(PINNED_MSG_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate allows org admin who is not pinner", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{ [PINNED_MSG_ID]: { pinnedBy: OTHER_USER_ID, channelId: CHANNEL_ID } },
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canUpdate(PINNED_MSG_ID), layer, admin)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate denies non-pinner non-admin", async () => {
		const outsider = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${OTHER_USER_ID}`]: "member" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{ [PINNED_MSG_ID]: { pinnedBy: ADMIN_USER_ID, channelId: CHANNEL_ID } },
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canUpdate(PINNED_MSG_ID), layer, outsider)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canDelete allows pinner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{ [PINNED_MSG_ID]: { pinnedBy: actor.id, channelId: CHANNEL_ID } },
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canDelete(PINNED_MSG_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete allows org admin who is not pinner", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{ [PINNED_MSG_ID]: { pinnedBy: OTHER_USER_ID, channelId: CHANNEL_ID } },
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canDelete(PINNED_MSG_ID), layer, admin)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete denies non-pinner non-admin", async () => {
		const outsider = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer(
			{ [`${TEST_ORG_ID}:${OTHER_USER_ID}`]: "member" },
			{ [CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID } },
			{ [PINNED_MSG_ID]: { pinnedBy: ADMIN_USER_ID, channelId: CHANNEL_ID } },
		)

		const result = await runWithActorEither(PinnedMessagePolicy.canDelete(PINNED_MSG_ID), layer, outsider)
		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(UnauthorizedError.is(result.left)).toBe(true)
		}
	})
})
