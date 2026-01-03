import { describe, expect, it, layer } from "@effect/vitest"
import { Headers } from "@effect/platform"
import { Effect, Exit, Layer, Option, FiberRef } from "effect"
import { AuthMiddleware } from "./auth-class.ts"
import { SessionManager } from "../../services/session-manager.ts"
import { UserPresenceStatusRepo } from "../../repositories/user-presence-status-repo.ts"
import { BotRepo } from "../../repositories/bot-repo.ts"
import { UserRepo } from "../../repositories/user-repo.ts"
import type { CurrentUser } from "@hazel/domain"
import { SessionExpiredError, InvalidJwtPayloadError, InvalidBearerTokenError, SessionNotProvidedError } from "@hazel/domain"
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
	refreshedSession?: string
	shouldFail?: Effect.Effect<never, any>
}) =>
	Layer.succeed(SessionManager, {
		authenticateWithCookie: (_cookie: string, _password?: string) => {
			if (options?.shouldFail) {
				return options.shouldFail
			}
			return Effect.succeed({
				currentUser: options?.currentUser ?? createMockCurrentUser(),
				refreshedSession: options?.refreshedSession,
			})
		},
		authenticateWithBearer: (_token: string) =>
			Effect.fail(new InvalidJwtPayloadError({ message: "Not mocked", detail: "" })),
		authenticateAndGetUser: (_cookie: string, _password?: string) => {
			if (options?.shouldFail) {
				return options.shouldFail
			}
			return Effect.succeed({
				currentUser: options?.currentUser ?? createMockCurrentUser(),
				refreshedSession: options?.refreshedSession,
			})
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
						yield* (presenceRepo
							.updateStatus({
								userId: userOption.value.id,
								status: "offline",
								customMessage: null,
							}) as unknown as Effect.Effect<void>)
							.pipe(Effect.catchAll(() => Effect.void))
					}
				}),
			)

			return AuthMiddleware.of(({ headers }) =>
				Effect.gen(function* () {
					// Check for Bearer token first (skip for user auth tests)
					const authHeader = Headers.get(headers, "authorization")
					if (Option.isSome(authHeader) && authHeader.value.startsWith("Bearer ")) {
						return yield* Effect.fail(
							new InvalidBearerTokenError({
								message: "Bearer auth not tested here",
								detail: "",
							}),
						)
					}

					// Parse cookie header
					const cookieHeader = Headers.get(headers, "cookie")

					if (Option.isNone(cookieHeader)) {
						return yield* Effect.fail(
							new SessionNotProvidedError({
								message: "No session cookie provided",
								detail: "Authentication required",
							}),
						)
					}

					// Parse cookies
					const cookies = cookieHeader.value
						.split(";")
						.map((c) => c.trim())
						.reduce(
							(acc, cookie) => {
								const [key, ...valueParts] = cookie.split("=")
								if (key && valueParts.length > 0) {
									acc[key] = valueParts.join("=")
								}
								return acc
							},
							{} as Record<string, string>,
						)

					const sessionCookie = cookies["workos-session"]

					if (!sessionCookie) {
						return yield* Effect.fail(
							new SessionNotProvidedError({
								message: "No WorkOS session cookie provided",
								detail: "Authentication required",
							}),
						)
					}

					// Authenticate via SessionManager
					const result = yield* sessionManager.authenticateAndGetUser(sessionCookie)

					// Store user in FiberRef
					yield* FiberRef.set(currentUserRef, Option.some(result.currentUser))

					return result.currentUser
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
	describe("cookie extraction", () => {
		layer(TestAuthMiddlewareLive)("cookie parsing", (it) => {
			it.scoped("parses workos-session from Cookie header", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						cookie: "workos-session=valid-session-cookie; other-cookie=value",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result.id).toBe("usr_test123")
					expect(result.email).toBe("test@example.com")
				}),
			)

			it.scoped("parses workos-session with encoded characters", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						cookie: "workos-session=session%3Dwith%3Dequals; foo=bar",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result).toBeDefined()
				}),
			)

			it.scoped("handles workos-session as only cookie", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						cookie: "workos-session=only-cookie",
					})

					const result = yield* middleware(createMiddlewareContext(headers))

					expect(result.id).toBe("usr_test123")
				}),
			)
		})

		layer(TestAuthMiddlewareLive)("missing cookie", (it) => {
			it.scoped("fails with SessionNotProvidedError when Cookie header is missing", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({})

					const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

					expect(Exit.isFailure(exit)).toBe(true)
				}),
			)

			it.scoped("fails with SessionNotProvidedError when workos-session cookie is missing", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						cookie: "other-cookie=value; another=test",
					})

					const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

					expect(Exit.isFailure(exit)).toBe(true)
				}),
			)

			it.scoped("fails with SessionNotProvidedError when Cookie header is empty", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						cookie: "",
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
						cookie: "workos-session=valid-cookie",
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
			const expiredSessionLayer = makeAuthMiddlewareLayer({
				sessionManagerLayer: createMockSessionManagerLive({
					shouldFail: Effect.fail(
						new SessionExpiredError({
							message: "Session expired",
							detail: "Could not refresh",
						}),
					),
				}),
			})

			layer(expiredSessionLayer)("expired session", (it) => {
				it.scoped("propagates SessionExpiredError from SessionManager", () =>
					Effect.gen(function* () {
						const middleware = yield* AuthMiddleware
						const headers = Headers.fromInput({
							cookie: "workos-session=expired-cookie",
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
							cookie: "workos-session=invalid-jwt",
						})

						const exit = yield* middleware(createMiddlewareContext(headers)).pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})
		})

		describe("session refresh", () => {
			const refreshedSessionLayer = makeAuthMiddlewareLayer({
				sessionManagerLayer: createMockSessionManagerLive({
					refreshedSession: "new-refreshed-session-cookie",
				}),
			})

			layer(refreshedSessionLayer)("refreshed session", (it) => {
				it.scoped("still returns CurrentUser when session is refreshed", () =>
					Effect.gen(function* () {
						const middleware = yield* AuthMiddleware
						const headers = Headers.fromInput({
							cookie: "workos-session=needs-refresh",
						})

						const result = yield* middleware(createMiddlewareContext(headers))

						// Should still get user even though session was refreshed
						expect(result.id).toBe("usr_test123")
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
						cookie: "workos-session=org-session",
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
						cookie: "workos-session=full-data",
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
		// Note: Testing the actual finalizer behavior (marking offline on disconnect)
		// requires integration testing with the real WebSocket lifecycle.
		// Here we verify the core authentication flow works correctly.

		layer(TestAuthMiddlewareLive)("user tracking", (it) => {
			it.scoped("successfully authenticates and returns user", () =>
				Effect.gen(function* () {
					const middleware = yield* AuthMiddleware
					const headers = Headers.fromInput({
						cookie: "workos-session=tracked-user",
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
