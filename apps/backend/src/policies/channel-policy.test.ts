import { describe, expect, it } from "@effect/vitest"
import { ChannelRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { ChannelId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { ChannelPolicy } from "./channel-policy.ts"
import { OrganizationPolicy } from "./organization-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	runWithActorEither,
	TEST_ALT_ORG_ID,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const CHANNEL_ID = "00000000-0000-0000-0000-000000000301" as ChannelId
const MISSING_CHANNEL_ID = "00000000-0000-0000-0000-000000000399" as ChannelId

const makeOrganizationMemberRepoLayer = (members: Record<string, Role>) =>
	Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = members[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makeChannelRepoLayer = (channels: Record<string, { organizationId: OrganizationId }>) =>
	Layer.succeed(ChannelRepo, {
		with: <A, E, R>(
			id: ChannelId,
			f: (channel: { organizationId: OrganizationId }) => Effect.Effect<A, E, R>,
		) => {
			const channel = channels[id]
			if (!channel) {
				return Effect.fail(makeEntityNotFound("Channel"))
			}
			return f(channel)
		},
	} as unknown as ChannelRepo)

const makePolicyLayer = (
	members: Record<string, Role>,
	channels: Record<string, { organizationId: OrganizationId }>,
) =>
	ChannelPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeChannelRepoLayer(channels)),
		Layer.provide(
			OrganizationPolicy.DefaultWithoutDependencies.pipe(
				Layer.provide(makeOrganizationMemberRepoLayer(members)),
			),
		),
	)

describe("ChannelPolicy", () => {
	it("canCreate requires org membership", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
		)

		const allowed = await runWithActorEither(ChannelPolicy.canCreate(TEST_ORG_ID), layer, actor)
		const denied = await runWithActorEither(ChannelPolicy.canCreate(TEST_ALT_ORG_ID), layer, actor)

		expect(Either.isRight(allowed)).toBe(true)
		expect(Either.isLeft(denied)).toBe(true)
	})

	it("canUpdate allows org admins and maps not-found to UnauthorizedError", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "admin",
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID },
			},
		)

		const allowed = await runWithActorEither(ChannelPolicy.canUpdate(CHANNEL_ID), layer, actor)
		const missing = await runWithActorEither(ChannelPolicy.canUpdate(MISSING_CHANNEL_ID), layer, actor)

		expect(Either.isRight(allowed)).toBe(true)
		expect(Either.isLeft(missing)).toBe(true)
		if (Either.isLeft(missing)) {
			expect(UnauthorizedError.is(missing.left)).toBe(true)
		}
	})

	it("canDelete denies non-admin actors", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID },
			},
		)

		const result = await runWithActorEither(ChannelPolicy.canDelete(CHANNEL_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})
})
