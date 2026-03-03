import { describe, expect, it } from "@effect/vitest"
import { UnauthorizedError } from "@hazel/domain"
import { Effect, Either } from "effect"
import { makePolicy, withPolicyUnauthorized } from "./policy-utils.ts"
import { makeActor } from "../policies/policy-test-helpers.ts"
import { CurrentUser } from "@hazel/domain"

describe("policy-utils", () => {
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
})
