import { describe, expect, it } from "@effect/vitest"
import { ChannelMemberRepo, TypingIndicatorRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { ChannelId, ChannelMemberId, TypingIndicatorId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { TypingIndicatorPolicy } from "./typing-indicator-policy.ts"
import { makeActor, makeEntityNotFound, runWithActorEither, TEST_ORG_ID } from "./policy-test-helpers.ts"

const CHANNEL_ID = "00000000-0000-0000-0000-000000000501" as ChannelId
const MEMBER_ID = "00000000-0000-0000-0000-000000000601" as ChannelMemberId
const OTHER_MEMBER_ID = "00000000-0000-0000-0000-000000000602" as ChannelMemberId
const INDICATOR_ID = "00000000-0000-0000-0000-000000000701" as TypingIndicatorId
const MISSING_INDICATOR_ID = "00000000-0000-0000-0000-000000000799" as TypingIndicatorId

type MemberRecord = {
	id: ChannelMemberId
	channelId: ChannelId
	userId: UserId
	organizationId: typeof TEST_ORG_ID
}
type IndicatorRecord = { id: TypingIndicatorId; memberId: ChannelMemberId; channelId: ChannelId }

const makeChannelMemberRepoLayer = (
	recordsByMemberId: Record<string, MemberRecord>,
	recordsByChannelAndUser: Record<string, MemberRecord>,
) =>
	Layer.succeed(ChannelMemberRepo, {
		findByChannelAndUser: (channelId: ChannelId, userId: UserId) =>
			Effect.succeed(Option.fromNullable(recordsByChannelAndUser[`${channelId}:${userId}`])),
		with: <A, E, R>(id: ChannelMemberId, f: (member: MemberRecord) => Effect.Effect<A, E, R>) => {
			const member = recordsByMemberId[id]
			if (!member) {
				return Effect.fail(makeEntityNotFound("ChannelMember"))
			}
			return f(member)
		},
	} as unknown as ChannelMemberRepo)

const makeTypingIndicatorRepoLayer = (recordsById: Record<string, IndicatorRecord>) =>
	Layer.succeed(TypingIndicatorRepo, {
		with: <A, E, R>(id: TypingIndicatorId, f: (indicator: IndicatorRecord) => Effect.Effect<A, E, R>) => {
			const indicator = recordsById[id]
			if (!indicator) {
				return Effect.fail(makeEntityNotFound("TypingIndicator"))
			}
			return f(indicator)
		},
	} as unknown as TypingIndicatorRepo)

const makePolicyLayer = (
	channelMembersById: Record<string, MemberRecord>,
	channelMembersByChannelAndUser: Record<string, MemberRecord>,
	indicatorsById: Record<string, IndicatorRecord>,
) =>
	TypingIndicatorPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeChannelMemberRepoLayer(channelMembersById, channelMembersByChannelAndUser)),
		Layer.provide(makeTypingIndicatorRepoLayer(indicatorsById)),
	)

describe("TypingIndicatorPolicy", () => {
	it("canRead always allows authenticated actors", async () => {
		const layer = makePolicyLayer({}, {}, {})
		const result = await runWithActorEither(TypingIndicatorPolicy.canRead(INDICATOR_ID), layer)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canCreate requires channel membership", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{
				[`${CHANNEL_ID}:${actor.id}`]: {
					id: MEMBER_ID,
					channelId: CHANNEL_ID,
					userId: actor.id,
					organizationId: TEST_ORG_ID,
				},
			},
			{},
		)

		const allowed = await runWithActorEither(TypingIndicatorPolicy.canCreate(CHANNEL_ID), layer, actor)
		const denied = await runWithActorEither(
			TypingIndicatorPolicy.canCreate("00000000-0000-0000-0000-000000000599" as ChannelId),
			layer,
			actor,
		)

		expect(Either.isRight(allowed)).toBe(true)
		expect(Either.isLeft(denied)).toBe(true)
	})

	it("canUpdate allows only the member owner and maps missing indicator to UnauthorizedError", async () => {
		const actor = makeActor()
		const otherActor = makeActor({
			id: "00000000-0000-0000-0000-000000000103" as UserId,
		})

		const layer = makePolicyLayer(
			{
				[MEMBER_ID]: {
					id: MEMBER_ID,
					channelId: CHANNEL_ID,
					userId: actor.id,
					organizationId: TEST_ORG_ID,
				},
			},
			{},
			{
				[INDICATOR_ID]: {
					id: INDICATOR_ID,
					memberId: MEMBER_ID,
					channelId: CHANNEL_ID,
				},
			},
		)

		const ownerAllowed = await runWithActorEither(
			TypingIndicatorPolicy.canUpdate(INDICATOR_ID),
			layer,
			actor,
		)
		const otherDenied = await runWithActorEither(
			TypingIndicatorPolicy.canUpdate(INDICATOR_ID),
			layer,
			otherActor,
		)
		const missingDenied = await runWithActorEither(
			TypingIndicatorPolicy.canUpdate(MISSING_INDICATOR_ID),
			layer,
			actor,
		)

		expect(Either.isRight(ownerAllowed)).toBe(true)
		expect(Either.isLeft(otherDenied)).toBe(true)
		expect(Either.isLeft(missingDenied)).toBe(true)
		if (Either.isLeft(missingDenied)) {
			expect(UnauthorizedError.is(missingDenied.left)).toBe(true)
		}
	})

	it("canDelete works for both memberId and indicatorId variants", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[MEMBER_ID]: {
					id: MEMBER_ID,
					channelId: CHANNEL_ID,
					userId: actor.id,
					organizationId: TEST_ORG_ID,
				},
				[OTHER_MEMBER_ID]: {
					id: OTHER_MEMBER_ID,
					channelId: CHANNEL_ID,
					userId: "00000000-0000-0000-0000-000000000109" as UserId,
					organizationId: TEST_ORG_ID,
				},
			},
			{},
			{
				[INDICATOR_ID]: {
					id: INDICATOR_ID,
					memberId: MEMBER_ID,
					channelId: CHANNEL_ID,
				},
			},
		)

		const byMemberAllowed = await runWithActorEither(
			TypingIndicatorPolicy.canDelete({ memberId: MEMBER_ID }),
			layer,
			actor,
		)
		const byIndicatorAllowed = await runWithActorEither(
			TypingIndicatorPolicy.canDelete({ id: INDICATOR_ID }),
			layer,
			actor,
		)
		const byMemberDenied = await runWithActorEither(
			TypingIndicatorPolicy.canDelete({ memberId: OTHER_MEMBER_ID }),
			layer,
			actor,
		)

		expect(Either.isRight(byMemberAllowed)).toBe(true)
		expect(Either.isRight(byIndicatorAllowed)).toBe(true)
		expect(Either.isLeft(byMemberDenied)).toBe(true)
	})
})
