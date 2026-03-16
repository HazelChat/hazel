import { WorkOS as WorkOSNodeAPI } from "@workos-inc/node"
import { describe, expect, it, layer } from "@effect/vitest"
import { OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import { OrganizationMember, User } from "@hazel/domain/models"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import { AuthState, RelativeUrl } from "../lib/schema.ts"
import { configLayer, serviceShape } from "../test/effect-helpers"
import { WorkOSAuth as WorkOS, WorkOSAuthError as WorkOSApiError } from "../services/workos-auth.ts"

// ===== Mock Configuration =====

const TestConfigLive = configLayer({
	WORKOS_CLIENT_ID: "client_test_123",
	WORKOS_REDIRECT_URI: "http://localhost:3000/auth/callback",
	FRONTEND_URL: "http://localhost:3000",
	WORKOS_API_KEY: "sk_test_123",
})

const NOW = new Date("2026-03-05T12:00:00.000Z")

const makeUserRecord = (overrides: Partial<Schema.Schema.Type<typeof User.Model>> = {}) =>
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
	}) satisfies Schema.Schema.Type<typeof User.Model>

// ===== Mock WorkOS Service =====

const createMockWorkOSLive = (options?: {
	authorizationUrl?: string
	authenticateResponse?: {
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
	shouldFailAuth?: boolean
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
})
