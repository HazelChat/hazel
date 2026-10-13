import { afterEach, describe, expect, it, vi } from "vitest"
import { clearAccessToken, getAccessToken } from "./access-token"

afterEach(() => {
	clearAccessToken()
	vi.unstubAllGlobals()
})
describe("session token exchange", () => {
	it("sends the browser CSRF header", async () => {
		const fetch = vi.fn<typeof globalThis.fetch>(async () =>
			Response.json({ token: "current", expiresIn: 300 }),
		)
		vi.stubGlobal("fetch", fetch)
		expect(await getAccessToken()).toBe("current")
		expect(fetch.mock.calls[0]?.[1]).toMatchObject({
			credentials: "include",
			headers: { "x-effect-auth-csrf": "1" },
		})
	})
	it("does not restore a token or replace a new exchange after sign-out", async () => {
		let finish!: (response: Response) => void
		const fetch = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise<Response>((resolve) => {
						finish = resolve
					}),
			)
			.mockResolvedValue(Response.json({ token: "new", expiresIn: 300 }))
		vi.stubGlobal("fetch", fetch)
		const old = getAccessToken()
		await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
		clearAccessToken()
		expect(await getAccessToken()).toBe("new")
		finish(Response.json({ token: "old", expiresIn: 300 }))
		expect(await old).toBeNull()
		expect(await getAccessToken()).toBe("new")
	})
})
