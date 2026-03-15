import { describe, expect, it, layer } from "@effect/vitest"
import { Headers } from "effect/unstable/http"
import { BotRepo, UserPresenceStatusRepo, UserRepo } from "@hazel/backend-core"
import { Effect, Exit, Layer, Option, FiberRef } from "effect"
import { AuthMiddleware } from "./auth-class.ts"
import { SessionManager } from "../../services/session-manager.ts"
import type { CurrentUser } from "@hazel/domain"
import { SessionExpiredError, InvalidJwtPayloadError, InvalidBearerTokenError } from "@hazel/domain"
import type { UserId } from "@hazel/schema"

// ===== Mock CurrentUser Factory =====

const createMockCurrentUser = (overrides?: Partial<CurrentUser.Schema>): CurrentUser.Schema => ({
	id: "usr_test123" as UserId,
	email: "test@example.com",
	firstName: "Test",
	lastName: "User",
	avatarUrl: "https://example.com/avatar.png",
	role: "member" as const,
	isOnboarded: true,
	timezone: "UTC",
	organizationId: null,
	settings: null,
	...overrides,
})

// ===== Mock RPC Context =====
// Helper to create the full middleware context
const createMiddlewareContext = (headers: Headers.Headers) => ({
	clientId: 1,
	rpc: {} as any, // Mock RPC definition
	payload: {},
	headers,
})

// ===== Mock SessionManager Factory =====

const createMockSessionManagerLive = (options?: {
	currentUser?: CurrentUser.Schema
	shouldFail?: Effect.Effect<never, any>
}) =>
	Layer.succeed(SessionManager, {
		authenticateWithBearer: (_token: string) => {
			if (options?.shouldFail) {
				return options.shouldFail
			}
			return Effect.succeed(options?.currentUser ?? createMockCurrentUser())
		},
	} as unknown as SessionManager)

// ===== Mock UserPresenceStatusRepo =====

const createMockPresenceRepoLive = (options?: { onUpdateStatus?: (params: any) => void }) =>
	Layer.succeed(UserPresenceStatusRepo, {
		updateStatus: (params: any) => {
			options?.onUpdateStatus?.(params)
			return Effect.void
		},
		findByUserId: (_userId: string) => Effect.succeed(Option.none()),
	} as unknown as UserPresenceStatusRepo)

// ===== Mock BotRepo =====

const MockBotRepoLive = Layer.succeed(BotRepo, {
	findByTokenHash: (_hash: string) => Effect.succeed(Option.none()),
} as unknown as BotRepo)

// ===== Mock UserRepo =====

const MockUserRepoLive = Layer.succeed(UserRepo, {
	findById: (_id: string) => Effect.succeed(Option.none()),
} as unknown as UserRepo)

// ===== Auth Middleware Layer Factory =====

const makeAuthMiddlewareLayer = (options?: {
	sessionManagerLayer?: Layer.Layer<SessionManager>
	presenceRepoLayer?: Layer.Layer<UserPresenceStatusRepo>
}): Layer.Layer<AuthMiddleware> => {
	const sessionManagerLayer = options?.sessionManagerLayer ?? createMockSessionManagerLive()
	const presenceRepoLayer = options?.presenceRepoLayer ?? createMockPresenceRepoLive()

	return Layer.scoped(
		AuthMiddleware,
		Effect.gen(function* () {
			const sessionManager = yield* SessionManager
			const presenceRepo = yield* UserPresenceStatusRepo

			// Create a FiberRef to track the current user
			const currentUserRef = yield* FiberRef.make<Option.Option<CurrentUser.Schema>>(Option.none())

			// Add finalizer
			yield* Effect.addFinalizer(() =>
				Effect.gen(function* () {
					const userOption = yield* FiberRef.get(currentUserRef)
					if (Option.isSome(userOption)) {
						yield* (
							presenceRepo.updateStatus({
								userId: userOption.value.id,
								status: "offline",
								customMessage: null,
							}) as unknown as Effect.Effect<void>
						).pipe(Effect.catch(() => Effect.void))
					}
				}),
			)

			return AuthMiddleware.of(({ headers }) =>
				Effect.gen(function* () {
					// Require Bearer token
					const authHeader = Headers.get(headers, "authorization")
					if (Option.isNone(authHeader) || !authHeader.value.startsWith("Bearer ")) {
						return yield* new InvalidBearerTokenError({
							message: "No Bearer token provided",
							detail: "Authentication requires a Bearer token",
						})
					}

					const token = authHeader.value.slice(7)
					const currentUser = yield* sessionManager.authenticateWithBearer(token)

					// Store user in FiberRef
					yield* FiberRef.set(currentUserRef, Option.some(currentUser))

					return currentUser
				}),
			)
		}),
	).pipe(
		Layer.provide(sessionManagerLayer),
		Layer.provide(presenceRepoLayer),
		Layer.provide(MockBotRepoLive),
		Layer.provide(MockUserRepoLive),
	) as Layer.Layer<AuthMiddleware>
}

// Default test layer
const TestAuthMiddlewareLive = makeAuthMiddlewareLayer()

// ===== Tests =====

describe("AuthMiddleware", () => {
	describe("bearer token extraction", () => {
		layer(TestAuthMiddlewareLive)("bearer parsing", (it) => {
			it.scoped("parses Bearer token from Authorization header", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						authorization: "Bearer valid-bearer-token",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result.id).toBe("usr_test123")
					expect(result.email).toBe("test@example.com")
				}),
			)
		})

		layer(TestAuthMiddlewareLive)("missing token", (it) => {
			it.scoped("fails with InvalidBearerTokenError when Authorization header is missing", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({})

					const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

					expect(Exit.isFailure(exit)).toBe(true)
				}),
			)

			it.scoped("fails when Authorization header has no Bearer prefix", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						authorization: "Basic some-credentials",
					})

					const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

					expect(Exit.isFailure(exit)).toBe(true)
				}),
			)
		})
	})

	describe("session validation", () => {
		layer(TestAuthMiddlewareLive)("valid session", (it) => {
			it.scoped("returns CurrentUser on successful validation", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						authorization: "Bearer valid-token",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result.id).toBe("usr_test123")
					expect(result.email).toBe("test@example.com")
					expect(result.role).toBe("member")
					expect(result.isOnboarded).toBe(true)
				}),
			)
		})

		describe("error propagation", () => {
			const expiredTokenLayer = makeAuthMiddlewareLayer({
				sessionManagerLayer: createMockSessionManagerLive({
					shouldFail: Effect.fail(
						new SessionExpiredError({
							message: "Token expired",
							detail: "Could not verify",
						}),
					),
				}),
			})

			layer(expiredTokenLayer)("expired token", (it) => {
				it.scoped("propagates SessionExpiredError from SessionManager", () =>
					Effect.gen(function* () {
						const middleware = yield* AuthMiddleware
						const headers = Headers.fromInput({
							authorization: "Bearer expired-token",
						})

						const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})

			const invalidJwtLayer = makeAuthMiddlewareLayer({
				sessionManagerLayer: createMockSessionManagerLive({
					shouldFail: Effect.fail(
						new InvalidJwtPayloadError({
							message: "Invalid JWT",
							detail: "Malformed token",
						}),
					),
				}),
			})

			layer(invalidJwtLayer)("invalid JWT", (it) => {
				it.scoped("propagates InvalidJwtPayloadError from SessionManager", () =>
					Effect.gen(function* () {
						const middleware = yield* AuthMiddleware
						const headers = Headers.fromInput({
							authorization: "Bearer invalid-jwt",
						})

						const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})
		})
	})

	describe("user context", () => {
		const customUser = createMockCurrentUser({
			id: "usr_custom_user" as UserId,
			email: "custom@example.com",
			organizationId: "org_123" as any,
			role: "admin",
		})

		const customUserLayer = makeAuthMiddlewareLayer({
			sessionManagerLayer: createMockSessionManagerLive({
				currentUser: customUser,
			}),
		})

		layer(customUserLayer)("custom user data", (it) => {
			it.scoped("includes organization context when present", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						authorization: "Bearer org-token",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result.organizationId).toBe("org_123")
					expect(result.role).toBe("admin")
				}),
			)

			it.scoped("includes all user fields from session", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						authorization: "Bearer full-data-token",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result.id).toBe("usr_custom_user")
					expect(result.email).toBe("custom@example.com")
					expect(result.firstName).toBe("Test")
					expect(result.lastName).toBe("User")
					expect(result.avatarUrl).toBe("https://example.com/avatar.png")
				}),
			)
		})
	})

	describe("FiberRef tracking", () => {
		layer(TestAuthMiddlewareLive)("user tracking", (it) => {
			it.scoped("successfully authenticates and returns user", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						authorization: "Bearer tracked-user-token",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					// Verify user is returned correctly
					expect(result.id).toBe("usr_test123")
					expect(result.email).toBe("test@example.com")
				}),
			)
		})
	})
})
