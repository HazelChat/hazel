import { describe, expect, it } from "@effect/vitest"
import { UnauthorizedError } from "@hazel/domain"
import type { OrganizationId } from "@hazel/schema"
import { Effect, Either, Option } from "effect"
import {
	makeOrganizationScopeChecks,
	makePolicy,
	remapPolicyScope,
	withPolicyUnauthorized,
} from "./policy-utils.ts"
import { makeActor, TEST_ORG_ID } from "../policies/policy-test-helpers.ts"
import { policy } from "@hazel/domain"
import { CurrentUser } from "@hazel/domain"

describe("policy-utils", () => {
	describe("makeOrganizationScopeChecks", () => {
		it("evaluates member/admin/owner scopes correctly", async () => {
			const checks = makeOrganizationScopeChecks((organizationId, actorId) => {
				if (organizationId !== TEST_ORG_ID) {
					return Effect.succeed(Option.none())
				}

				if (actorId === makeActor().id) {
					return Effect.succeed(Option.some({ role: "admin" as const }))
				}

				return Effect.succeed(Option.none())
			})

			const isMember = await Effect.runPromise(checks.isMember(TEST_ORG_ID, makeActor().id))
			const isAdmin = await Effect.runPromise(checks.isAdmin(TEST_ORG_ID, makeActor().id))
			const isOwner = await Effect.runPromise(checks.isOwner(TEST_ORG_ID, makeActor().id))
			const isMissing = await Effect.runPromise(
				checks.isMember("00000000-0000-0000-0000-000000000099" as OrganizationId, makeActor().id),
			)

			expect(isMember).toBe(true)
			expect(isAdmin).toBe(true)
			expect(isOwner).toBe(false)
			expect(isMissing).toBe(false)
		})
	})

	describe("makePolicy", () => {
		it("returns an authorized actor when check passes", async () => {
			const authorize = makePolicy("Widget")
			const result = await Effect.runPromise(
				authorize("read", () => Effect.succeed(true)).pipe(
					Effect.provideService(CurrentUser.Context, makeActor()),
				),
			)

			expect(result.id).toBe(makeActor().id)
		})

		it("fails with UnauthorizedError when check denies", async () => {
			const authorize = makePolicy("Widget")
			const result = await Effect.runPromise(
				authorize("read", () => Effect.succeed(false)).pipe(
					Effect.provideService(CurrentUser.Context, makeActor()),
					Effect.either,
				),
			)

			expect(Either.isLeft(result)).toBe(true)
			if (Either.isLeft(result)) {
				expect(UnauthorizedError.is(result.left)).toBe(true)
			}
		})

		it("maps non-unauthorized errors to UnauthorizedError", async () => {
			const authorize = makePolicy("Widget")
			const result = await Effect.runPromise(
				authorize("read", () => Effect.fail({ _tag: "DatabaseError" as const })).pipe(
					Effect.provideService(CurrentUser.Context, makeActor()),
					Effect.either,
				),
			)

			expect(Either.isLeft(result)).toBe(true)
			if (Either.isLeft(result)) {
				expect(UnauthorizedError.is(result.left)).toBe(true)
			}
		})
	})

	describe("withPolicyUnauthorized", () => {
		it("preserves existing UnauthorizedError", async () => {
			const existing = new UnauthorizedError({
				message: "Already unauthorized",
				detail: "pre-existing",
			})

			const result = await Effect.runPromise(
				withPolicyUnauthorized("Widget", "read", Effect.fail(existing)).pipe(
					Effect.provideService(CurrentUser.Context, makeActor()),
					Effect.either,
				),
			)

			expect(Either.isLeft(result)).toBe(true)
			if (Either.isLeft(result)) {
				expect(result.left).toBe(existing)
			}
		})
	})

	describe("remapPolicyScope", () => {
		it("keeps runtime actor value while remapping scope phantom type", async () => {
			const source = policy("Organization", "isMember", () => Effect.succeed(true))
			const result = await Effect.runPromise(
				source.pipe(
					remapPolicyScope("Channel", "create"),
					Effect.provideService(CurrentUser.Context, makeActor()),
				),
			)

			expect(result.id).toBe(makeActor().id)
		})
	})
})
