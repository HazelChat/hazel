import { describe, expect, it, layer } from "@effect/vitest"
import { Effect, Exit, Option } from "effect"
import { SessionExpiredError } from "@hazel/domain"
import {
	BackendAuth,
	decodeInternalOrganizationIdFromWorkOS,
	decodeWorkOSJwtClaims,
	type UserRepoLike,
} from "./backend-auth.ts"
import type { UserId, WorkOSUserId } from "@hazel/schema"

const MOCK_USER_ID = "00000000-0000-4000-8000-000000000001" as UserId

// ===== Mock UserRepo Factory =====

const createMockUserRepo = (options?: {
	existingUser?: {
		id: UserId
		email: string
		firstName: string
		lastName: string
		avatarUrl: string | null
		isOnboarded: boolean
		timezone: string | null
		settings: null
	}
	onUpsert?: (user: any) => any
	shouldFailFind?: boolean
	shouldFailUpsert?: boolean
	shouldFailUpdate?: boolean
}): UserRepoLike => ({
	findByWorkOSUserId: (_workosUserId: WorkOSUserId) => {
		if (options?.shouldFailFind) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		return Effect.succeed(options?.existingUser ? Option.some(options.existingUser) : Option.none())
	},
	upsertWorkOSUser: (user: any) => {
		if (options?.shouldFailUpsert) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		const result = options?.onUpsert?.(user) ?? {
			id: MOCK_USER_ID,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			isOnboarded: user.isOnboarded,
			timezone: user.timezone,
			settings: null,
		}
		return Effect.succeed(result)
	},
	update: (data) => {
		if (options?.shouldFailUpdate) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		return Effect.succeed({
			id: data.id,
			email: options?.existingUser?.email ?? "test@example.com",
			firstName: data.firstName ?? options?.existingUser?.firstName ?? "Test",
			lastName: data.lastName ?? options?.existingUser?.lastName ?? "User",
			avatarUrl:
				data.avatarUrl !== undefined ? data.avatarUrl : (options?.existingUser?.avatarUrl ?? null),
			isOnboarded: options?.existingUser?.isOnboarded ?? true,
			timezone: options?.existingUser?.timezone ?? "UTC",
			settings: options?.existingUser?.settings ?? null,
		})
	},
})

// ===== Tests =====

describe("BackendAuth", () => {
	describe("decode helpers", () => {
		it.effect("decodes branded WorkOS JWT claims", () =>
			Effect.gen(function* () {
				const claims = yield* decodeWorkOSJwtClaims({
					sub: "user_01ABC123",
					org_id: "org_01ABC123",
					role: "member",
					email: "test@example.com",
				})

				expect(claims.sub).toBe("user_01ABC123")
				expect(claims.org_id).toBe("org_01ABC123")
				expect(claims.role).toBe("member")
			}),
		)

		it.effect("decodes internal organization IDs from WorkOS externalId", () =>
			Effect.gen(function* () {
				const orgId = yield* decodeInternalOrganizationIdFromWorkOS(
					"00000000-0000-4000-8000-000000000099",
				)

				expect(orgId).toBe("00000000-0000-4000-8000-000000000099")
			}),
		)

		it.effect("fails invalid WorkOS external organization IDs", () =>
			Effect.gen(function* () {
				const exit = yield* decodeInternalOrganizationIdFromWorkOS("not-a-uuid").pipe(Effect.exit)

				expect(Exit.isFailure(exit)).toBe(true)
			}),
		)
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
		describe("failure scenarios", () => {
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
