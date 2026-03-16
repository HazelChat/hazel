import { describe, expect, it } from "@effect/vitest"
import { UnauthorizedError } from "@hazel/domain"
import { Result, Layer } from "effect"
import { IntegrationConnectionPolicy } from "./integration-connection-policy.ts"
import {
	buildServiceLayer,
	makeActor,
	makeOrgResolverLayer,
	runWithActorEither,
	serviceEffect,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const makePolicyLayer = (members: Record<string, Role>) =>
	buildServiceLayer(IntegrationConnectionPolicy).pipe(Layer.provide(makeOrgResolverLayer(members)))

describe("IntegrationConnectionPolicy", () => {
	it("allows select for any org member", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			[`${TEST_ORG_ID}:${actor.id}`]: "member",
		})

		const result = await runWithActorEither(
			serviceEffect(IntegrationConnectionPolicy, (policy) => policy.canSelect(TEST_ORG_ID)),
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
			serviceEffect(IntegrationConnectionPolicy, (policy) => policy.canInsert(TEST_ORG_ID)),
			layer,
			actor,
		)
		const update = await runWithActorEither(
			serviceEffect(IntegrationConnectionPolicy, (policy) => policy.canUpdate(TEST_ORG_ID)),
			layer,
			actor,
		)
		const del = await runWithActorEither(
			serviceEffect(IntegrationConnectionPolicy, (policy) => policy.canDelete(TEST_ORG_ID)),
			layer,
			actor,
		)

		expect(Result.isFailure(insert)).toBe(true)
		expect(Result.isFailure(update)).toBe(true)
		expect(Result.isFailure(del)).toBe(true)

		if (Result.isFailure(insert)) {
			expect(UnauthorizedError.is(insert.failure)).toBe(true)
		}
	})
})
