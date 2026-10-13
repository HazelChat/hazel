import { PgClient } from "@effect/sql-pg"
import { CryptoLive, identityKey, linkIdentity } from "@hazel/auth/server"
import { Effect, Redacted } from "effect"
import { SqlClient } from "effect/sql"
import type { User } from "@clerk/backend"
import { expect, it } from "vitest"
import { importIdentity, providerAccounts } from "./import-clerk-identities"

it("imports only explicitly verified GitHub or Google accounts", () => {
	const user = {
		externalAccounts: [
			{ provider: "oauth_github", providerUserId: "1", verification: null },
			{ provider: "oauth_google", providerUserId: "2", verification: { status: "failed" } },
			{ provider: "oauth_github", providerUserId: "3", verification: { status: "verified" } },
		],
	} as unknown as User
	expect(providerAccounts(user)).toEqual([{ provider: "github", subject: "3" }])
})

it.skipIf(!process.env.AUTH_TEST_DATABASE_URL)(
	"dry runs report ownership conflicts and never insert available identities",
	async () => {
		const original = "00000000-0000-4000-8000-000000000111"
		const candidate = "00000000-0000-4000-8000-000000000112"
		const account = { provider: "github" as const, subject: crypto.randomUUID() }
		const unlinked = { provider: "google" as const, subject: crypto.randomUUID(), userId: candidate }
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				yield* linkIdentity({ ...account, userId: original })
				const conflict = yield* importIdentity({ ...account, userId: candidate }, false)
				const available = yield* importIdentity(unlinked, false)
				const sql = yield* SqlClient.SqlClient
				const key = yield* identityKey(unlinked)
				const rows =
					yield* sql`select "identityKey" from auth_oauth_identities where "identityKey" = ${key}`
				return { conflict, available, rows }
			}).pipe(
				Effect.provide(
					PgClient.layer({ url: Redacted.make(process.env.AUTH_TEST_DATABASE_URL!), ssl: false }),
				),
				Effect.provide(CryptoLive),
			),
		)
		expect(result.conflict).toEqual({ _tag: "Conflict", ownerId: original })
		expect(result.available._tag).toBe("Available")
		expect(result.rows).toHaveLength(0)
	},
)
