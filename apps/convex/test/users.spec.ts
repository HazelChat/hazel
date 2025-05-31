import type { TestConvex } from "convex-test"
import { describe, expect, test } from "vitest"
import { api } from "../convex/_generated/api"
import { convexTest, createAccount, createServerAndAccount, createUser, randomIdentity } from "./utils/data-generator"
import type schema from "../convex/schema"

async function setupServer(convexTest: TestConvex<typeof schema>) {
	const t = randomIdentity(convexTest)
	const { server } = await createServerAndAccount(t)
	return server
}

describe("user", () => {
	test("creation and retrieval works", async () => {
		const server = await setupServer(convexTest())

		const t = randomIdentity(convexTest())
		await createAccount(t)
		const userId = await createUser(t, { serverId: server })

		const user = await t.query(api.users.getUser, { serverId: server, userId: userId })
		expect(user?._id).toEqual(userId)
	})

	test("cannot be created without authentication", async () => {
		const server = await setupServer(convexTest())
		const t = convexTest()
		await expect(createUser(t, { serverId: server })).rejects.toThrow()
	})

	test("cannot be created without an account", async () => {
		const server = await setupServer(convexTest())
		const t = randomIdentity(convexTest())
		await expect(createUser(t, { serverId: server })).rejects.toThrow()
	})

	test("cannot be retrieved without being a member of the server", async () => {
		const server = await setupServer(convexTest())
		const ct = convexTest()
		const t = randomIdentity(ct)
		await createAccount(t)
		const userId = await createUser(t, { serverId: server })

		const t2 = randomIdentity(ct)
		await expect(t2.query(api.users.getUser, { serverId: server, userId: userId })).rejects.toThrow()
	})

	test("cannot be retrieved with a user that is not on the same server", async () => {
		const ct = convexTest()
		const server1 = await setupServer(ct)
		const server2 = await setupServer(ct)

		const t = randomIdentity(ct)
		await createAccount(t)
		const userId1 = await createUser(t, { serverId: server1 })

		await createAccount(t)
		const userId2 = await createUser(t, { serverId: server2 })

		await expect(t.query(api.users.getUser, { serverId: server1, userId: userId2 })).rejects.toThrow()
		await expect(t.query(api.users.getUser, { serverId: server2, userId: userId1 })).rejects.toThrow()
	})

	test("lists only users on the same server", async () => {
		const ct = convexTest()
		const server1 = await setupServer(ct)
		const server2 = await setupServer(ct)

		const t = randomIdentity(ct)
		await createAccount(t)
		const userId1 = await createUser(t, { serverId: server1 })
		const userId2 = await createUser(t, { serverId: server2 })

		const users1 = await t.query(api.users.getUsers, { serverId: server1 })
		expect(users1).toHaveLength(2)
		expect(users1[1]?._id).toEqual(userId1)

		const users2 = await t.query(api.users.getUsers, { serverId: server2 })
		expect(users2).toHaveLength(2)
		expect(users2[1]?._id).toEqual(userId2)
	})
})
