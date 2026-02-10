import { describe, expect, it } from "@effect/vitest"
import { OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { OrganizationPolicy } from "./organization-policy.ts"
import { makeActor, runWithActorEither, TEST_ALT_ORG_ID, TEST_ORG_ID } from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const makeOrganizationMemberRepoLayer = (members: Record<string, Role>) =>
	Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = members[`${organizationId}:${userId}`]
			if (!role) {
				return Effect.succeed(Option.none())
			}

			return Effect.succeed(
				Option.some({
					organizationId,
					userId,
					role,
				}),
			)
		},
	} as unknown as OrganizationMemberRepo)

const makePolicyLayer = (members: Record<string, Role>) =>
	OrganizationPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeOrganizationMemberRepoLayer(members)),
	)

describe("OrganizationPolicy", () => {
	it("canCreate allows any authenticated actor", async () => {
		const result = await runWithActorEither(OrganizationPolicy.canCreate(), makePolicyLayer({}))
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate allows admin and owner, denies plain member", async () => {
		const adminActor = makeActor()
		const memberActor = makeActor({
			id: "00000000-0000-0000-0000-000000000222" as UserId,
		})

		const layer = makePolicyLayer({
			[`${TEST_ORG_ID}:${adminActor.id}`]: "admin",
			[`${TEST_ORG_ID}:${memberActor.id}`]: "member",
		})

		const adminResult = await runWithActorEither(
			OrganizationPolicy.canUpdate(TEST_ORG_ID),
			layer,
			adminActor,
		)
		const memberResult = await runWithActorEither(
			OrganizationPolicy.canUpdate(TEST_ORG_ID),
			layer,
			memberActor,
		)

		expect(Either.isRight(adminResult)).toBe(true)
		expect(Either.isLeft(memberResult)).toBe(true)
		if (Either.isLeft(memberResult)) {
			expect(UnauthorizedError.is(memberResult.left)).toBe(true)
		}
	})

	it("canDelete allows owner only", async () => {
		const ownerActor = makeActor()
		const adminActor = makeActor({
			id: "00000000-0000-0000-0000-000000000223" as UserId,
		})

		const layer = makePolicyLayer({
			[`${TEST_ORG_ID}:${ownerActor.id}`]: "owner",
			[`${TEST_ORG_ID}:${adminActor.id}`]: "admin",
		})

		const ownerResult = await runWithActorEither(
			OrganizationPolicy.canDelete(TEST_ORG_ID),
			layer,
			ownerActor,
		)
		const adminResult = await runWithActorEither(
			OrganizationPolicy.canDelete(TEST_ORG_ID),
			layer,
			adminActor,
		)

		expect(Either.isRight(ownerResult)).toBe(true)
		expect(Either.isLeft(adminResult)).toBe(true)
	})

	it("isMember denies users without membership in target org", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			[`${TEST_ALT_ORG_ID}:${actor.id}`]: "member",
		})

		const result = await runWithActorEither(OrganizationPolicy.isMember(TEST_ORG_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(UnauthorizedError.is(result.left)).toBe(true)
		}
	})

	it("canManagePublicInvite allows admin-or-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			[`${TEST_ORG_ID}:${actor.id}`]: "owner",
		})

		const result = await runWithActorEither(
			OrganizationPolicy.canManagePublicInvite(TEST_ORG_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})
})
