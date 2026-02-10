import { describe, expect, it } from "@effect/vitest"
import { OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { IntegrationConnectionPolicy } from "./integration-connection-policy.ts"
import { makeActor, runWithActorEither, TEST_ORG_ID } from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const makeOrganizationMemberRepoLayer = (members: Record<string, Role>) =>
	Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = members[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makePolicyLayer = (members: Record<string, Role>) =>
	IntegrationConnectionPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeOrganizationMemberRepoLayer(members)),
	)

describe("IntegrationConnectionPolicy", () => {
	it("allows select for any org member", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			[`${TEST_ORG_ID}:${actor.id}`]: "member",
		})

		const result = await runWithActorEither(
			IntegrationConnectionPolicy.canSelect(TEST_ORG_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("allows insert/update/delete for admin-or-owner only", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			[`${TEST_ORG_ID}:${actor.id}`]: "member",
		})

		const insert = await runWithActorEither(
			IntegrationConnectionPolicy.canInsert(TEST_ORG_ID),
			layer,
			actor,
		)
		const update = await runWithActorEither(
			IntegrationConnectionPolicy.canUpdate(TEST_ORG_ID),
			layer,
			actor,
		)
		const del = await runWithActorEither(IntegrationConnectionPolicy.canDelete(TEST_ORG_ID), layer, actor)

		expect(Either.isLeft(insert)).toBe(true)
		expect(Either.isLeft(update)).toBe(true)
		expect(Either.isLeft(del)).toBe(true)

		if (Either.isLeft(insert)) {
			expect(UnauthorizedError.is(insert.left)).toBe(true)
		}
	})
})
