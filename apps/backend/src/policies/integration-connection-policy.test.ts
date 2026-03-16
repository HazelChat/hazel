import { describe, expect, it } from "@effect/vitest"
import { UnauthorizedError } from "@hazel/domain"
import { Result, Layer } from "effect"
import { IntegrationConnectionPolicy } from "./integration-connection-policy.ts"
import { makeActor, makeOrgResolverLayer, runWithActorEither, TEST_ORG_ID } from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const makePolicyLayer = (members: Record<string, Role>) =>
	IntegrationConnectionPolicy.DefaultWithoutDependencies.pipe(Layer.provide(makeOrgResolverLayer(members)))

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
		expect(Result.isSuccess(result)).toBe(true)
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

		expect(Result.isFailure(insert)).toBe(true)
		expect(Result.isFailure(update)).toBe(true)
		expect(Result.isFailure(del)).toBe(true)

		if (Result.isFailure(insert)) {
			expect(UnauthorizedError.is(insert.left)).toBe(true)
		}
	})
})
