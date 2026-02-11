import { createServer } from "node:http"
import { exportJWK, generateKeyPair, SignJWT } from "jose"
import { afterEach, describe, expect, it, vi } from "vitest"

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
	const mod = await import("./message-actor.ts")
	return (mod.messageActor as any).config.createConnState as (
		context: unknown,
		params: { token?: string },
	) => Promise<any>
}

afterEach(() => {
	resetEnv()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

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
						userId: "user-bot-1",
						botId: "bot-1",
						organizationId: "org-1",
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
					userId: "user-bot-1",
					botId: "bot-1",
					organizationId: "org-1",
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
			vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
				const url =
					typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url

				if (url.startsWith(expectedJwksUrl)) {
					return new Response(JSON.stringify(jwks), {
						status: 200,
						headers: { "content-type": "application/json" },
					})
				}

				return originalFetch(input as any, init)
			}),
		)

		const createConnState = await loadCreateConnState()

		await expect(createConnState(createContext(), { token })).resolves.toMatchObject({
			type: "user",
			userId: "user-42",
			organizationId: "org-42",
			role: "admin",
		})
	})
})
