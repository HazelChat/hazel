import { describe, expect, it, layer } from "@effect/vitest"
import { Effect, Exit, Option } from "effect"
import { SessionExpiredError, SessionNotProvidedError } from "@hazel/domain"
import { BackendAuth, type UserRepoLike } from "./backend-auth.ts"
import { ValidatedSession } from "../types.ts"
import type { UserId } from "@hazel/schema"

// ===== Mock UserRepo Factory =====

const createMockUserRepo = (options?: {
	existingUser?: {
		id: UserId
		email: string
		firstName: string
		lastName: string
		avatarUrl: string
		isOnboarded: boolean
		timezone: string | null
	}
	onUpsert?: (user: any) => any
	shouldFailFind?: boolean
	shouldFailUpsert?: boolean
}): UserRepoLike => ({
	findByExternalId: (_externalId: string) => {
		if (options?.shouldFailFind) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		return Effect.succeed(
			options?.existingUser ? Option.some(options.existingUser) : Option.none(),
		)
	},
	upsertByExternalId: (user: any) => {
		if (options?.shouldFailUpsert) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		const result = options?.onUpsert?.(user) ?? {
			id: `usr_${Date.now()}` as UserId,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			isOnboarded: user.isOnboarded,
			timezone: user.timezone,
		}
		return Effect.succeed(result)
	},
})

// ===== Tests =====

describe("BackendAuth", () => {
	describe("authenticateWithCookie", () => {
		layer(BackendAuth.Test)("successful authentication", (it) => {
			it.effect("returns CurrentUser with correct fields", () =>
				Effect.gen(function* () {
					const auth = yield* BackendAuth
					const userRepo = createMockUserRepo()

					const result = yield* auth.authenticateWithCookie("valid-session-cookie", userRepo)

					expect(result.currentUser.email).toBe("test@example.com")
					expect(result.currentUser.role).toBe("member")
					expect(result.currentUser.id).toBe(BackendAuth.mockUserId)
				}),
			)

			it.effect("returns undefined refreshedSession by default", () =>
				Effect.gen(function* () {
					const auth = yield* BackendAuth
					const userRepo = createMockUserRepo()

					const result = yield* auth.authenticateWithCookie("valid-session", userRepo)

					expect(result.refreshedSession).toBeUndefined()
				}),
			)
		})
	})

	describe("authenticateWithBearer", () => {
		layer(BackendAuth.Test)("successful authentication", (it) => {
			it.effect("returns CurrentUser", () =>
				Effect.gen(function* () {
					const auth = yield* BackendAuth
					const userRepo = createMockUserRepo()

					const result = yield* auth.authenticateWithBearer("valid-bearer-token", userRepo)

					expect(result.email).toBe("test@example.com")
					expect(result.role).toBe("member")
				}),
			)
		})
	})

	describe("TestWith", () => {
		describe("custom current user", () => {
			// Use a valid UUID for the custom user
			const customUserId = "00000000-0000-0000-0000-000000000999" as UserId
			const customUser = BackendAuth.mockCurrentUser()
			// Override some fields
			const modifiedUser = {
				...customUser,
				id: customUserId,
				email: "custom@example.com",
				role: "admin" as const,
			}

			layer(BackendAuth.TestWith({ currentUser: modifiedUser as any }))("custom user", (it) => {
				it.effect("returns custom CurrentUser", () =>
					Effect.gen(function* () {
						const auth = yield* BackendAuth
						const userRepo = createMockUserRepo()

						const result = yield* auth.authenticateWithCookie("cookie", userRepo)

						expect(result.currentUser.id).toBe(customUserId)
						expect(result.currentUser.email).toBe("custom@example.com")
						expect(result.currentUser.role).toBe("admin")
					}),
				)
			})
		})

		describe("session refresh", () => {
			layer(
				BackendAuth.TestWith({
					refreshedSession: "new-refreshed-session-cookie",
				}),
			)("with refresh", (it) => {
				it.effect("returns new sealed session", () =>
					Effect.gen(function* () {
						const auth = yield* BackendAuth
						const userRepo = createMockUserRepo()

						const result = yield* auth.authenticateWithCookie("expired-session", userRepo)

						expect(result.refreshedSession).toBe("new-refreshed-session-cookie")
					}),
				)
			})
		})

		describe("failure scenarios", () => {
			layer(
				BackendAuth.TestWith({
					shouldFail: {
						authenticateWithCookie: Effect.fail(
							new SessionExpiredError({
								message: "Session expired",
								detail: "The session could not be refreshed",
							}),
						),
					},
				}),
			)("expired session", (it) => {
				it.effect("fails with SessionExpiredError", () =>
					Effect.gen(function* () {
						const auth = yield* BackendAuth
						const userRepo = createMockUserRepo()

						const exit = yield* auth
							.authenticateWithCookie("expired-session", userRepo)
							.pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})

			layer(
				BackendAuth.TestWith({
					shouldFail: {
						authenticateWithCookie: Effect.fail(
							new SessionNotProvidedError({
								message: "No session cookie provided",
								detail: "The session was not authenticated",
							}),
						),
					},
				}),
			)("missing session", (it) => {
				it.effect("fails with SessionNotProvidedError", () =>
					Effect.gen(function* () {
						const auth = yield* BackendAuth
						const userRepo = createMockUserRepo()

						const exit = yield* auth.authenticateWithCookie("", userRepo).pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})

			layer(
				BackendAuth.TestWith({
					shouldFail: {
						authenticateWithBearer: Effect.fail(
							new SessionExpiredError({
								message: "Bearer token expired",
								detail: "The bearer token could not be verified",
							}),
						),
					},
				}),
			)("bearer auth failure", (it) => {
				it.effect("fails with error on bearer auth", () =>
					Effect.gen(function* () {
						const auth = yield* BackendAuth
						const userRepo = createMockUserRepo()

						const exit = yield* auth
							.authenticateWithBearer("invalid-token", userRepo)
							.pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})
		})
	})
})
