import { describe, expect, test } from "vitest"
import { api } from "../convex/_generated/api"

import { convexTest, createAccount, createServer, randomIdentity } from "./utils/data-generator"

describe("servers", () => {
	test("cannot be created without authentication", async () => {
		const t = convexTest()
		await expect(createServer(t)).rejects.toThrow()
	})

	test("cannot be created without an account", async () => {
		const t = randomIdentity(convexTest())
		await expect(createServer(t)).rejects.toThrow()
	})

	test("can be created with an account", async () => {
		const t = randomIdentity(convexTest())
		await createAccount(t)
		const server = await createServer(t)
		await expect(server).toBeDefined()
	})

	test("cannot be retrieved without authentication", async () => {
		const t = convexTest()
		const authenticatedT = t.withIdentity({ tokenIdentifier: "test" })
		await createAccount(authenticatedT)
		const server = await createServer(authenticatedT)
		await expect(t.query(api.servers.getServer, { serverId: server })).rejects.toThrow()
	})

	test("can be retrieved with authentication", async () => {
		const t = randomIdentity(convexTest())
		await createAccount(t)
		const server = await createServer(t)
		const retrievedServer = await t.query(api.servers.getServer, { serverId: server })
		await expect(retrievedServer?._id).toMatch(server)
	})

	test("cannot be retrieved when not member of the server", async () => {
		const ct = convexTest()
		const t1 = randomIdentity(ct)
		await createAccount(t1)
		const server = await createServer(t1)
		const t2 = randomIdentity(ct)
		await expect(t2.query(api.servers.getServer, { serverId: server })).rejects.toThrow()
	})

	test("create user when creating server", async () => {
		const t = randomIdentity(convexTest())
		await createAccount(t)
		const server = await createServer(t)
		const user = await t.query(api.users.getUsers, { serverId: server })
		await expect(user).toBeDefined()
	})
})
