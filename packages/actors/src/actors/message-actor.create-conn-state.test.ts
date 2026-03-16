import { createServer } from "node:http"
import { BotId, OrganizationId, UserId, WorkOSOrganizationId, WorkOSUserId } from "@hazel/schema"
import { decodeJwt, exportJWK, generateKeyPair, SignJWT } from "jose"
import { afterEach, describe, expect, it, vi } from "vitest"
import type * as EffectType from "effect/Effect"
import type * as HttpClientType from "effect/unstable/http/HttpClient"
import type {
	AuthenticatedClient,
	BotClient,
	BotTokenValidationError,
	ConfigError,
	InvalidTokenFormatError,
	JwtValidationError,
	UserClient,
} from "../auth"

const ORIGINAL_ENV = { ...process.env }

const resetEnv = () => {
	for (const key of Object.keys(process.env)) {
		if (!(key in ORIGINAL_ENV)) {
			delete process.env[key]
		}
	}

	for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
		if (value === undefined) {
			delete process.env[key]
		} else {
			process.env[key] = value
		}
	}
}

const createContext = () => ({
	log: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	},
})

const loadCreateConnState = async () => {
	vi.resetModules()
	vi.doMock("../effect/runtime", async () => {
		const { Effect, Layer, ManagedRuntime, Schema } = await import("effect")
		const { FetchHttpClient, HttpClient } = await import("effect/unstable/http")
		const auth = await import("../auth")
		const {
			BotTokenValidationError,
			ConfigError,
			InvalidTokenFormatError,
			JwtValidationError,
			TokenValidationService,
		} = auth

		const decodeUserId = Schema.decodeUnknownSync(UserId)
		const decodeBotId = Schema.decodeUnknownSync(BotId)
		const decodeOrganizationId = Schema.decodeUnknownSync(OrganizationId)
		const decodeWorkOsUserId = Schema.decodeUnknownSync(WorkOSUserId)
		const decodeWorkOsOrganizationId = Schema.decodeUnknownSync(WorkOSOrganizationId)

		const validateBotToken = (
			token: string,
		): EffectType.Effect<BotClient, BotTokenValidationError | ConfigError, HttpClientType.HttpClient> =>
			Effect.gen(function* () {
				yield* HttpClient.HttpClient

				const backendUrl =
					process.env.BACKEND_URL ??
					process.env.API_BASE_URL ??
					process.env.VITE_BACKEND_URL ??
					process.env.VITE_API_BASE_URL

				if (!backendUrl) {
					return yield* Effect.fail(
						new ConfigError({
							message:
								"BACKEND_URL or API_BASE_URL environment variable is required for bot token actor authentication",
						}),
					)
				}

				const response = yield* Effect.tryPromise({
					try: () =>
						fetch(`${backendUrl}/internal/actors/validate-bot-token`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ token }),
						}),
					catch: (cause) =>
						new BotTokenValidationError({
							message: `Failed to validate bot token: ${String(cause)}`,
						}),
				})

				if (!response.ok) {
					const errorText = yield* Effect.promise(() => response.text())
					return yield* Effect.fail(
						new BotTokenValidationError({
							message: `Invalid bot token: ${errorText}`,
							statusCode: response.status,
						}),
					)
				}

				const data = (yield* Effect.promise(() => response.json())) as {
					userId: string
					botId: string
					organizationId: string | null
					scopes: readonly string[] | null
				}

				return {
					type: "bot" as const,
					userId: decodeUserId(data.userId),
					botId: decodeBotId(data.botId),
					organizationId:
						data.organizationId === null ? null : decodeOrganizationId(data.organizationId),
					scopes: data.scopes,
				}
			})

		const validateJwt = (
			token: string,
		): EffectType.Effect<UserClient, JwtValidationError | ConfigError> =>
			Effect.gen(function* () {
				if (!process.env.WORKOS_CLIENT_ID) {
					return yield* Effect.fail(
						new ConfigError({
							message:
								"WORKOS_CLIENT_ID environment variable is required for JWT actor authentication",
						}),
					)
				}

				const claims = yield* Effect.try({
					try: () => decodeJwt(token),
					catch: (cause) =>
						new JwtValidationError({
							message: "Invalid or expired token",
							cause,
						}),
				})

				return {
					type: "user" as const,
					workosUserId: decodeWorkOsUserId(String(claims.sub)),
					workosOrganizationId:
						typeof claims.org_id === "string" ? decodeWorkOsOrganizationId(claims.org_id) : null,
					role: claims.role === "admin" ? "admin" : "member",
				}
			})

		const validateToken = (
			token: string,
		): EffectType.Effect<
			AuthenticatedClient,
			InvalidTokenFormatError | JwtValidationError | BotTokenValidationError | ConfigError,
			HttpClientType.HttpClient
		> => {
			if (token.startsWith("hzl_bot_")) {
				return validateBotToken(token)
			}
			if (token.split(".").length === 3) {
				return validateJwt(token)
			}
			return Effect.fail(
				new InvalidTokenFormatError({
					message: "Invalid token format",
				}),
			)
		}

		return {
			messageActorRuntime: ManagedRuntime.make(
				Layer.mergeAll(
					FetchHttpClient.layer,
					Layer.succeed(
						TokenValidationService,
						TokenValidationService.of({
							validateBotToken,
							validateJwt,
							validateToken,
						}),
					),
				),
			),
		}
	})
	const mod = await import("./message-actor.ts")
	return (
		mod.messageActor as {
			config: {
				createConnState: (context: unknown, params: { token?: string }) => Promise<unknown>
			}
		}
	).config.createConnState as (context: unknown, params: { token?: string }) => Promise<unknown>
}

afterEach(() => {
	resetEnv()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

const BOT_USER_ID = "00000000-0000-4000-8000-000000000011"
const BOT_ID = "00000000-0000-4000-8000-000000000022"
const BOT_ORG_ID = "00000000-0000-4000-8000-000000000033"

describe("messageActor.createConnState", () => {
	it("returns invalid_token user error for invalid token format", async () => {
		const createConnState = await loadCreateConnState()

		await expect(createConnState(createContext(), { token: "not-a-valid-token" })).rejects.toMatchObject({
			code: "invalid_token",
		})
	})

	it("returns auth_unavailable when bot token validation has no backend URL configured", async () => {
		delete process.env.BACKEND_URL
		delete process.env.API_BASE_URL
		delete process.env.VITE_BACKEND_URL
		delete process.env.VITE_API_BASE_URL

		const createConnState = await loadCreateConnState()

		await expect(
			createConnState(createContext(), { token: "hzl_bot_missing_backend" }),
		).rejects.toMatchObject({
			code: "auth_unavailable",
		})
	})

	it("validates bot tokens through backend endpoint", async () => {
		const server = createServer((req, res) => {
			if (req.method === "POST" && req.url === "/internal/actors/validate-bot-token") {
				res.writeHead(200, { "content-type": "application/json" })
				res.end(
					JSON.stringify({
						userId: BOT_USER_ID,
						botId: BOT_ID,
						organizationId: BOT_ORG_ID,
						scopes: ["messages:write"],
					}),
				)
				return
			}

			res.writeHead(404, { "content-type": "text/plain" })
			res.end("Not Found")
		})

		await new Promise<void>((resolve) => {
			server.listen(0, "127.0.0.1", () => resolve())
		})

		const address = server.address()
		if (!address || typeof address === "string") {
			throw new Error("Failed to get local test server address")
		}

		try {
			process.env.BACKEND_URL = `http://127.0.0.1:${address.port}`
			const createConnState = await loadCreateConnState()

			await expect(createConnState(createContext(), { token: "hzl_bot_valid" })).resolves.toMatchObject(
				{
					type: "bot",
					userId: BOT_USER_ID,
					botId: BOT_ID,
					organizationId: BOT_ORG_ID,
					scopes: ["messages:write"],
				},
			)
		} finally {
			await new Promise<void>((resolve, reject) => {
				server.close((error) => {
					if (error) {
						reject(error)
						return
					}
					resolve()
				})
			})
		}
	})

	it("validates JWTs with WorkOS JWKS and returns user identity", async () => {
		process.env.WORKOS_CLIENT_ID = "client-test"

		const { publicKey, privateKey } = await generateKeyPair("RS256")
		const publicJwk = await exportJWK(publicKey)
		const jwks = {
			keys: [
				{
					...publicJwk,
					kid: "test-key-id",
					alg: "RS256",
					use: "sig",
				},
			],
		}

		const token = await new SignJWT({ org_id: "org-42", role: "admin" })
			.setProtectedHeader({ alg: "RS256", kid: "test-key-id" })
			.setIssuer("https://api.workos.com")
			.setSubject("user-42")
			.setIssuedAt()
			.setExpirationTime("10m")
			.sign(privateKey)

		const originalFetch = globalThis.fetch
		const expectedJwksUrl = "https://api.workos.com/sso/jwks/client-test"

		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
				const url =
					typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url

				if (url.startsWith(expectedJwksUrl)) {
					return new Response(JSON.stringify(jwks), {
						status: 200,
						headers: { "content-type": "application/json" },
					})
				}

				return originalFetch(input, init)
			}),
		)

		const createConnState = await loadCreateConnState()

		await expect(createConnState(createContext(), { token })).resolves.toMatchObject({
			type: "user",
			workosUserId: "user-42",
			workosOrganizationId: "org-42",
			role: "admin",
		})
	})
})
