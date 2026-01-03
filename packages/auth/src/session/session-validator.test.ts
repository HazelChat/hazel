import { describe, expect, it, layer } from "@effect/vitest"
import { Effect, Exit } from "effect"
import { SessionExpiredError } from "@hazel/domain"
import { SessionValidator } from "./session-validator.ts"
import { ValidatedSession } from "../types.ts"

// ===== Tests =====

describe("SessionValidator", () => {
	// Default Test layer - returns mock session
	layer(SessionValidator.Test)("validateSession", (it) => {
		it.effect("returns validated session", () =>
			Effect.gen(function* () {
				const validator = yield* SessionValidator
				const result = yield* validator.validateSession("any-cookie")

				expect(result.workosUserId).toBe("user_01ABC123")
				expect(result.email).toBe("test@example.com")
				expect(result.sessionId).toBe("sess_abc123")
			}),
		)
	})

	layer(SessionValidator.Test)("validateAndRefresh", (it) => {
		it.effect("returns session without refresh", () =>
			Effect.gen(function* () {
				const validator = yield* SessionValidator
				const result = yield* validator.validateAndRefresh("valid-session")

				expect(result.session.workosUserId).toBe("user_01ABC123")
				expect(result.newSealedSession).toBeUndefined()
			}),
		)
	})

	layer(SessionValidator.Test)("invalidate", (it) => {
		it.effect("invalidates cached session", () =>
			Effect.gen(function* () {
				const validator = yield* SessionValidator
				yield* validator.invalidate("session-to-invalidate")
			}),
		)
	})

	describe("TestWith", () => {
		describe("custom session", () => {
			const customSession = new ValidatedSession({
				workosUserId: "custom_user_123",
				email: "custom@example.com",
				sessionId: "sess_custom",
				organizationId: "org_workos",
				internalOrganizationId: "org_internal",
				role: "admin",
				accessToken: "custom-token",
				firstName: "Custom",
				lastName: "User",
				profilePictureUrl: "https://example.com/avatar.png",
				expiresAt: Math.floor(Date.now() / 1000) + 7200,
			})

			layer(SessionValidator.TestWith({ session: customSession }))("custom session", (it) => {
				it.effect("returns custom session", () =>
					Effect.gen(function* () {
						const validator = yield* SessionValidator
						const result = yield* validator.validateSession("cookie")

						expect(result.workosUserId).toBe("custom_user_123")
						expect(result.email).toBe("custom@example.com")
						expect(result.organizationId).toBe("org_workos")
						expect(result.internalOrganizationId).toBe("org_internal")
						expect(result.role).toBe("admin")
					}),
				)
			})
		})

		describe("with refresh", () => {
			layer(
				SessionValidator.TestWith({
					newSealedSession: "new-refreshed-session-cookie",
				}),
			)("refresh response", (it) => {
				it.effect("returns new sealed session", () =>
					Effect.gen(function* () {
						const validator = yield* SessionValidator
						const result = yield* validator.validateAndRefresh("cookie")

						expect(result.newSealedSession).toBe("new-refreshed-session-cookie")
					}),
				)
			})
		})

		describe("failure scenarios", () => {
			layer(
				SessionValidator.TestWith({
					shouldFail: {
						validateSession: Effect.fail(
							new SessionExpiredError({
								message: "Session expired",
								detail: "Test error",
							}),
						),
					},
				}),
			)("expired session", (it) => {
				it.effect("fails with error", () =>
					Effect.gen(function* () {
						const validator = yield* SessionValidator
						const exit = yield* validator.validateSession("cookie").pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})
		})
	})
})
