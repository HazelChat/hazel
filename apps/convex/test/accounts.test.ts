import { describe, expect, test } from "vitest"
import { api } from "../convex/_generated/api"
import { convexTest, createAccount, randomIdentity } from "./utils/data-generator"

describe("accounts", () => {
	test("creating and retrieving accounts works", async () => {
		const t = randomIdentity(convexTest())
		const account = await createAccount(t)

		const createdAccount = await t.query(api.accounts.getAccount, { id: account })

		expect(createdAccount?._id).toEqual(account)
	})

	test("creating accounts multiple times returns the same id", async () => {
		const t = randomIdentity(convexTest())
		const id = await createAccount(t)
		const id2 = await createAccount(t)
		expect(id).toEqual(id2)
	})

	test("creating accounts without authentication fails", async () => {
		const t = convexTest()
		await expect(createAccount(t)).rejects.toThrow()
	})

	test("cannot be retrieved if not authenticated", async () => {
		const t = convexTest()

		const authenticatedT = t.withIdentity({ tokenIdentifier: "test" })
		const id = await createAccount(authenticatedT)

		await expect(t.query(api.accounts.getAccount, { id })).rejects.toThrow()
	})

	test("cannot retrieve accounts from other users when not having an account", async () => {
		const ct = convexTest()
		const t1 = randomIdentity(ct)
		const id = await createAccount(t1)

		const t2 = randomIdentity(ct)
		await expect(t2.query(api.accounts.getAccount, { id })).rejects.toThrow()
	})

	test("cannot retrieve accounts from other users when having an account", async () => {
		const ct = convexTest()
		const t1 = randomIdentity(ct)
		const id = await createAccount(t1)

		const t2 = randomIdentity(ct)
		await expect(t2.query(api.accounts.getAccount, { id })).rejects.toThrow()
	})
})
