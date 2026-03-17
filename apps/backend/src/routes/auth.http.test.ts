import { WorkOS as WorkOSNodeAPI } from "@workos-inc/node"
import { NodeHttpPlatform, NodeServices } from "@effect/platform-node"
import { describe, expect, it, layer } from "@effect/vitest"
import { OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import { Etag, HttpRouter } from "effect/unstable/http"
import { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"
import { AuthGroup, RefreshTokenResponse, TokenResponse } from "@hazel/domain/http"
import { OrganizationMember, User } from "@hazel/domain/models"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import { vi } from "vitest"
import { AuthState, RelativeUrl } from "../lib/schema.ts"
import { HttpAuthLive } from "./auth.http.ts"
import { AuthRedemptionStore } from "../services/auth-redemption-store.ts"
import { configLayer, serviceShape } from "../test/effect-helpers"
import { WorkOSAuth as WorkOS, WorkOSAuthError as WorkOSApiError } from "../services/workos-auth.ts"

vi.mock("@hazel/effect-bun", async () => {
	const { Layer, ServiceMap } = await import("effect")
	class Redis extends ServiceMap.Service<
		Redis,
		{
			readonly get: (key: string) => unknown
			readonly del: (key: string) => unknown
			readonly send: <T = unknown>(command: string, args: string[]) => T
		}
	>()("@hazel/effect-bun/Redis") {}

	return {
		Redis: Object.assign(Redis, {
			Default: Layer.empty,
		}),
	}
})

import { Redis } from "@hazel/effect-bun"

// ===== Mock Configuration =====

const TestConfigLive = configLayer({
	WORKOS_CLIENT_ID: "client_test_123",
	WORKOS_REDIRECT_URI: "http://localhost:3000/auth/callback",
	FRONTEND_URL: "http://localhost:3000",
	WORKOS_API_KEY: "sk_test_123",
})

const NOW = new Date("2026-03-05T12:00:00.000Z")
const makeJwt = (exp: number = Math.floor(Date.now() / 1000) + 3600) => {
	const encode = (value: Record<string, unknown>) =>
		Buffer.from(JSON.stringify(value)).toString("base64url")
	return `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp, sid: "session_test_123" })}.`
}

const makeUserRecord = (overrides: Partial<Schema.Schema.Type<typeof User.Schema>> = {}) =>
	({
		id: "usr_default123" as UserId,
		externalId: "user_default",
		email: "test@example.com",
		firstName: "Test",
		lastName: "User",
		avatarUrl: null,
		userType: "user",
		settings: null,
		isOnboarded: false,
		timezone: null,
		createdAt: NOW,
		updatedAt: NOW,
		deletedAt: null,
		...overrides,
	}) satisfies Schema.Schema.Type<typeof User.Schema>

// ===== Mock WorkOS Service =====

const createMockWorkOSLive = (options?: {
	authorizationUrl?: string
	authenticateResponse?: {
		accessToken?: string
		refreshToken?: string
		user: {
			id: string
			email: string
			firstName?: string | null
			lastName?: string | null
			profilePictureUrl?: string | null
		}
		sealedSession?: string
		organizationId?: string
	}
	refreshResponse?: {
		accessToken?: string
		refreshToken?: string
	}
	shouldFailAuth?: boolean
	shouldFailRefresh?: boolean
	shouldFailLogin?: boolean
	shouldFailGetOrg?: boolean
}) =>
	Layer.succeed(WorkOS, {
		call: <A>(f: (client: WorkOSNodeAPI, signal: AbortSignal) => Promise<A>) =>
			Effect.tryPromise({
				try: async () => {
					const mockClient = {
						userManagement: {
							getAuthorizationUrl: (params: { clientId: string; state?: string }) => {
								if (options?.shouldFailLogin) {
									throw new Error("WorkOS API error")
								}
								return (
									options?.authorizationUrl ??
									`https://workos.com/auth?client_id=${params.clientId}&state=${params.state}`
								)
							},
							authenticateWithCode: async () => {
								if (options?.shouldFailAuth) {
									throw new Error("Authentication failed")
								}
								return {
									accessToken: options?.authenticateResponse?.accessToken ?? makeJwt(),
									refreshToken:
										options?.authenticateResponse?.refreshToken ?? "refresh-token",
									user: options?.authenticateResponse?.user ?? {
										id: "user_01ABC123",
										email: "test@example.com",
										firstName: "Test",
										lastName: "User",
										profilePictureUrl: null,
									},
									sealedSession:
										options?.authenticateResponse?.sealedSession ??
										"sealed-session-cookie",
									organizationId: options?.authenticateResponse?.organizationId,
								}
							},
							authenticateWithRefreshToken: async () => {
								if (options?.shouldFailRefresh) {
									throw new Error("Refresh failed")
								}
								return {
									accessToken: options?.refreshResponse?.accessToken ?? makeJwt(),
									refreshToken:
										options?.refreshResponse?.refreshToken ?? "refresh-token-next",
								}
							},
							listOrganizationMemberships: async () => ({
								data: [{ role: { slug: "member" } }],
							}),
						},
						organizations: {
							getOrganization: async (id: string) => {
								if (options?.shouldFailGetOrg) {
									throw new Error("Org not found")
								}
								return {
									id,
									externalId: "org_internal_123",
								}
							},
							getOrganizationByExternalId: async (externalId: string) => {
								if (options?.shouldFailGetOrg) {
									throw new Error("Org not found")
								}
								return {
									id: "org_workos_123",
									externalId,
								}
							},
						},
					}

					return f(mockClient as unknown as WorkOSNodeAPI, new AbortController().signal)
				},
				catch: (cause) => new WorkOSApiError({ cause }),
			}),
	} satisfies ServiceMap.Service.Shape<typeof WorkOS>)

// ===== Mock UserRepo =====

const createMockUserRepoLive = (options?: {
	existingUser?: {
		id: UserId
		email: string
		firstName: string
		lastName: string
		avatarUrl: string | null
		isOnboarded: boolean
		timezone: string | null
	}
}) =>
	Layer.succeed(UserRepo, {
		findByExternalId: (_externalId: string) =>
			Effect.succeed(options?.existingUser ? Option.some(options.existingUser) : Option.none()),
		upsertByExternalId: (user: Schema.Schema.Type<typeof User.Insert>) =>
			Effect.succeed(
				makeUserRecord({
					id: "usr_new123" as UserId,
					externalId: user.externalId,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					avatarUrl: user.avatarUrl ?? null,
					isOnboarded: user.isOnboarded,
					timezone: user.timezone,
				}),
			),
		upsertWorkOSUser: (user: Schema.Schema.Type<typeof User.Insert>) =>
			Effect.succeed(
				makeUserRecord({
					id: "usr_workos123" as UserId,
					externalId: user.externalId,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					avatarUrl: user.avatarUrl ?? null,
					isOnboarded: user.isOnboarded,
					timezone: user.timezone,
				}),
			),
	} as unknown as ServiceMap.Service.Shape<typeof UserRepo>)

// ===== Mock OrganizationMemberRepo =====

const MockOrganizationMemberRepoLive = Layer.succeed(
	OrganizationMemberRepo,
	serviceShape<typeof OrganizationMemberRepo>({
		findByOrgAndUser: (_orgId: OrganizationId, _userId: UserId) => Effect.succeed(Option.none()),
		upsertByOrgAndUser: (_membership: Schema.Schema.Type<typeof OrganizationMember.Insert>) =>
			Effect.succeed({
				id: "00000000-0000-4000-8000-000000000099",
			}),
	}),
)

// ===== Test Layer Factory =====

const makeTestLayer = (options?: {
	workosLayer?: Layer.Layer<WorkOS>
	userRepoLayer?: Layer.Layer<UserRepo>
}) => {
	const workosLayer = options?.workosLayer ?? createMockWorkOSLive()
	const userRepoLayer = options?.userRepoLayer ?? createMockUserRepoLive()

	return Layer.mergeAll(workosLayer, userRepoLayer, MockOrganizationMemberRepoLive, TestConfigLive)
}

// Default test layer
const TestLayer = makeTestLayer()
const TestAuthApi = HttpApi.make("HazelApp").add(AuthGroup)

const makeRedisLayer = () => {
	const store = new Map<string, { value: string; expiresAt: number | null }>()

	const getValue = (key: string): string | null => {
		const entry = store.get(key)
		if (!entry) return null
		if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
			store.delete(key)
			return null
		}
		return entry.value
	}

	const setValue = (key: string, value: string, ttlMs?: number) => {
		store.set(key, {
			value,
			expiresAt: ttlMs === undefined ? null : Date.now() + ttlMs,
		})
	}

	return Layer.succeed(
		Redis,
		serviceShape<typeof Redis>({
			get: (key: string) => Effect.succeed(getValue(key)),
			del: (key: string) =>
				Effect.sync(() => {
					store.delete(key)
				}),
			send: <T>(command: string, args: string[]) =>
				Effect.sync(() => {
					if (command === "EVAL") {
						const [, , key, processingValue, ttlMs] = args
						const existing = getValue(key)
						if (existing === null) {
							setValue(key, processingValue, Number(ttlMs))
							return ["claimed", ""] as T
						}
						return ["existing", existing] as T
					}

					if (command === "SET") {
						const [key, value, , ttlMs] = args
						setValue(key, value, Number(ttlMs))
						return "OK" as T
					}

					throw new Error(`Unsupported Redis command in test: ${command}`)
				}),
		}),
	)
}

const makeAuthRouteHandler = (options?: {
	workosLayer?: Layer.Layer<WorkOS>
	userRepoLayer?: Layer.Layer<UserRepo>
}) => {
	const authStoreLayer = Layer.effect(AuthRedemptionStore, AuthRedemptionStore.make).pipe(
		Layer.provide(makeRedisLayer()),
	)
	const authGroupLayer = HttpAuthLive.pipe(
		Layer.provideMerge(authStoreLayer),
		Layer.provideMerge(options?.workosLayer ?? createMockWorkOSLive()),
		Layer.provideMerge(options?.userRepoLayer ?? createMockUserRepoLive()),
		Layer.provideMerge(TestConfigLive),
	)

	const appLayer = HttpApiBuilder.layer(TestAuthApi).pipe(
		Layer.provideMerge(authGroupLayer),
		Layer.provideMerge(HttpRouter.layer),
		Layer.provideMerge(Etag.layer),
		Layer.provideMerge(NodeServices.layer),
		Layer.provideMerge(NodeHttpPlatform.layer),
	)

	return HttpRouter.toWebHandler(appLayer as never, {
		disableLogger: true,
	})
}

// ===== Tests =====

describe("Auth HTTP Endpoint Logic", () => {
	describe("RelativeUrl schema validation", () => {
		it("accepts valid relative URLs", () => {
			expect(() => Schema.decodeSync(RelativeUrl)("/dashboard")).not.toThrow()
			expect(() => Schema.decodeSync(RelativeUrl)("/settings/profile")).not.toThrow()
			expect(() => Schema.decodeSync(RelativeUrl)("/")).not.toThrow()
		})

		it("rejects absolute URLs", () => {
			expect(() => Schema.decodeSync(RelativeUrl)("https://evil.com")).toThrow()
			expect(() => Schema.decodeSync(RelativeUrl)("http://example.com")).toThrow()
		})

		it("rejects protocol-relative URLs", () => {
			expect(() => Schema.decodeSync(RelativeUrl)("//evil.com/path")).toThrow()
		})

		it("rejects empty URLs", () => {
			expect(() => Schema.decodeSync(RelativeUrl)("")).toThrow()
		})

		it("rejects URLs not starting with /", () => {
			expect(() => Schema.decodeSync(RelativeUrl)("dashboard")).toThrow()
		})
	})

	describe("AuthState schema", () => {
		it("creates valid AuthState", () => {
			const state = Schema.decodeSync(AuthState)({ returnTo: "/dashboard" })
			expect(state.returnTo).toBe("/dashboard")
		})

		it("serializes and deserializes correctly", () => {
			const state = Schema.decodeSync(AuthState)({ returnTo: "/settings/profile" })
			const serialized = JSON.stringify(state)
			const parsed = Schema.decodeSync(AuthState)(JSON.parse(serialized))
			expect(parsed.returnTo).toBe("/settings/profile")
		})
	})

	describe("Login flow", () => {
		layer(TestLayer)("authorization URL generation", (it) => {
			it.effect("generates WorkOS authorization URL", () =>
				Effect.gen(function* () {
					const workos = yield* WorkOS

					const url = yield* workos.call(async (client) => {
						return client.userManagement.getAuthorizationUrl({
							provider: "authkit",
							clientId: "test_client",
							redirectUri: "http://localhost/callback",
							state: JSON.stringify({ returnTo: "/dashboard" }),
						})
					})

					expect(url).toContain("workos.com")
					expect(url).toContain("client_id")
				}),
			)

			it.effect("includes state parameter with returnTo", () =>
				Effect.gen(function* () {
					const workos = yield* WorkOS
					const returnTo = "/settings/profile"
					const state = JSON.stringify({ returnTo })

					const url = yield* workos.call(async (client) => {
						return client.userManagement.getAuthorizationUrl({
							provider: "authkit",
							clientId: "test_client",
							redirectUri: "http://localhost/callback",
							state,
						})
					})

					// The state is passed to WorkOS and included in the URL
					// (real SDK would URL-encode, our mock just appends directly)
					expect(url).toContain("state=")
					expect(url).toContain(returnTo)
				}),
			)
		})

		describe("organization context", () => {
			layer(TestLayer)("with organization", (it) => {
				it.effect("resolves organization by external ID", () =>
					Effect.gen(function* () {
						const workos = yield* WorkOS

						const org = yield* workos.call(async (client) => {
							return client.organizations.getOrganizationByExternalId("org_internal_123")
						})

						expect(org.id).toBe("org_workos_123")
					}),
				)
			})

			const failingOrgLayer = makeTestLayer({
				workosLayer: createMockWorkOSLive({ shouldFailGetOrg: true }),
			})

			layer(failingOrgLayer)("organization lookup failure", (it) => {
				it.effect("handles organization lookup failure gracefully", () =>
					Effect.gen(function* () {
						const workos = yield* WorkOS

						const result = yield* workos
							.call(async (client) => {
								return client.organizations.getOrganizationByExternalId("nonexistent")
							})
							.pipe(Effect.exit)

						expect(result._tag).toBe("Failure")
					}),
				)
			})
		})
	})

	describe("Callback flow", () => {
		layer(TestLayer)("code exchange", (it) => {
			it.effect("exchanges code for authentication response", () =>
				Effect.gen(function* () {
					const workos = yield* WorkOS

					const authResponse = yield* workos.call(async (client) => {
						return client.userManagement.authenticateWithCode({
							clientId: "test_client",
							code: "authorization_code",
							session: {
								sealSession: true,
								cookiePassword: "password",
							},
						})
					})

					expect(authResponse.user.id).toBe("user_01ABC123")
					expect(authResponse.user.email).toBe("test@example.com")
					expect(authResponse.sealedSession).toBe("sealed-session-cookie")
				}),
			)
		})

		describe("user sync", () => {
			layer(TestLayer)("new user", (it) => {
				it.effect("creates user on first login", () =>
					Effect.gen(function* () {
						const userRepo = yield* UserRepo

						const existingUser = yield* userRepo.findByExternalId("user_new")
						expect(Option.isNone(existingUser)).toBe(true)

						const createdUser = yield* userRepo.upsertByExternalId({
							externalId: "user_new",
							email: "new@example.com",
							firstName: "New",
							lastName: "User",
							avatarUrl: null,
							userType: "user",
							settings: null,
							isOnboarded: false,
							timezone: null,
							deletedAt: null,
						})

						expect(createdUser.id).toBe("usr_new123")
						expect(createdUser.email).toBe("new@example.com")
					}),
				)
			})

			const existingUserLayer = makeTestLayer({
				userRepoLayer: createMockUserRepoLive({
					existingUser: {
						id: "usr_existing456" as UserId,
						email: "existing@example.com",
						firstName: "Existing",
						lastName: "User",
						avatarUrl: "https://example.com/avatar.png",
						isOnboarded: true,
						timezone: "America/Los_Angeles",
					},
				}),
			})

			layer(existingUserLayer)("existing user", (it) => {
				it.effect("finds existing user without creating", () =>
					Effect.gen(function* () {
						const userRepo = yield* UserRepo

						const existingUser: Option.Option<{
							id: UserId
							email: string
							isOnboarded: boolean
						}> = yield* userRepo.findByExternalId("user_existing")
						expect(Option.isSome(existingUser)).toBe(true)

						if (Option.isSome(existingUser)) {
							expect(existingUser.value.id).toBe("usr_existing456")
							expect(existingUser.value.email).toBe("existing@example.com")
							expect(existingUser.value.isOnboarded).toBe(true)
						}
					}),
				)
			})
		})

		describe("error handling", () => {
			const failingAuthLayer = makeTestLayer({
				workosLayer: createMockWorkOSLive({ shouldFailAuth: true }),
			})

			layer(failingAuthLayer)("auth failure", (it) => {
				it.effect("handles authentication failure", () =>
					Effect.gen(function* () {
						const workos = yield* WorkOS

						const result = yield* workos
							.call(async (client) => {
								return client.userManagement.authenticateWithCode({
									clientId: "test_client",
									code: "invalid_code",
									session: { sealSession: true, cookiePassword: "password" },
								})
							})
							.pipe(Effect.exit)

						expect(result._tag).toBe("Failure")
					}),
				)
			})
		})

		describe("organization membership", () => {
			const authWithOrgLayer = makeTestLayer({
				workosLayer: createMockWorkOSLive({
					authenticateResponse: {
						user: {
							id: "user_org_member",
							email: "orgmember@example.com",
						},
						sealedSession: "org-session-cookie",
						organizationId: "org_workos_456",
					},
				}),
			})

			layer(authWithOrgLayer)("with organization context", (it) => {
				it.effect("returns organization ID in auth response", () =>
					Effect.gen(function* () {
						const workos = yield* WorkOS

						const authResponse = yield* workos.call(async (client) => {
							return client.userManagement.authenticateWithCode({
								clientId: "test_client",
								code: "org_code",
								session: { sealSession: true, cookiePassword: "password" },
							})
						})

						expect(authResponse.organizationId).toBe("org_workos_456")
					}),
				)
			})
		})
	})

	describe("HTTP route success encoding", () => {
		it("returns HTTP 200 with a decodable TokenResponse for /auth/token", async () => {
			const { handler, dispose } = makeAuthRouteHandler()

			try {
				const response = await handler(
					new Request("http://localhost/auth/token", {
						method: "POST",
						headers: {
							"content-type": "application/json",
							"x-auth-attempt-id": "attempt_token_123",
						},
						body: JSON.stringify({
							code: "authorization_code",
							state: JSON.stringify({ returnTo: "/" }),
						}),
					}),
					ServiceMap.empty() as ServiceMap.ServiceMap<any>,
				)

				expect(response.status).toBe(200)

				const body = await response.json()
				const decoded = Schema.decodeUnknownSync(TokenResponse)(body)

				expect(decoded.accessToken).toContain(".")
				expect(decoded.refreshToken).toBe("refresh-token")
				expect(decoded.user.email).toBe("test@example.com")
			} finally {
				await dispose()
			}
		})

		it("returns HTTP 200 with a decodable RefreshTokenResponse for /auth/refresh", async () => {
			const { handler, dispose } = makeAuthRouteHandler()

			try {
				const response = await handler(
					new Request("http://localhost/auth/refresh", {
						method: "POST",
						headers: {
							"content-type": "application/json",
							"x-auth-attempt-id": "attempt_refresh_123",
						},
						body: JSON.stringify({
							refreshToken: "refresh-token",
						}),
					}),
					ServiceMap.empty() as ServiceMap.ServiceMap<any>,
				)

				expect(response.status).toBe(200)

				const body = await response.json()
				const decoded = Schema.decodeUnknownSync(RefreshTokenResponse)(body)

				expect(decoded.accessToken).toContain(".")
				expect(decoded.refreshToken).toBe("refresh-token-next")
			} finally {
				await dispose()
			}
		})
	})
})
