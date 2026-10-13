/**
 * Find orgs that appear to be duplicated after the Clerk migration.
 * Groups active orgs by lowercased name. For each group with >1 row,
 * prints slug, logoUrl, clerkOrganizationId (from settings), member count,
 * channel count, and createdAt so we can see the canonical row vs. the ghost.
 */

import { Database, PG, schema } from "@hazel/db"
import { Effect, Logger } from "effect"
import { DatabaseLive } from "../../services/database"

const program = Effect.gen(function* () {
	const db = yield* Database.Database

	const orgs = yield* db.run(
		PG.from(schema.organizationsTable)
			.select("id", "name", "slug", "logoUrl", "settings", "createdAt")
			.where(($) => [$.deletedAt.isNull()]),
	)

	yield* Effect.log(`Total active orgs: ${orgs.length}`)

	const byName = new Map<string, Array<(typeof orgs)[number]>>()
	for (const o of orgs) {
		const key = o.name.trim().toLowerCase()
		const list = byName.get(key) ?? []
		list.push(o)
		byName.set(key, list)
	}

	const dupes = [...byName.entries()].filter(([_, list]) => list.length > 1)
	yield* Effect.log(`Name groups with >1 row: ${dupes.length}`)

	for (const [name, list] of dupes) {
		yield* Effect.log(`\n=== "${name}" — ${list.length} rows ===`)
		for (const o of list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
			const memberCount = yield* db.run(
				PG.from(schema.organizationMembersTable)
					.select(() => ({ n: PG.count() }))
					.where(($) => [$.organizationId.eq(o.id), $.deletedAt.isNull()]),
			)

			const channelCount = yield* db.run(
				PG.from(schema.channelsTable)
					.select(() => ({ n: PG.count() }))
					.where(($) => [$.organizationId.eq(o.id), $.deletedAt.isNull()]),
			)

			const messageCount = yield* db.run(
				PG.from(schema.messagesTable, "m")
					.innerJoin(schema.channelsTable, "c", (m, c) => c.id.eq(m.channelId))
					.select(() => ({ n: PG.count() }))
					.where(($) => [$.c.organizationId.eq(o.id)]),
			)

			const clerkOrgId = (o.settings as any)?.clerkOrganizationId ?? "(none)"
			yield* Effect.log(
				`  id=${o.id}  slug=${o.slug}  logoUrl=${o.logoUrl ? "set" : "null"}  clerkOrgId=${clerkOrgId}  members=${memberCount[0]!.n}  channels=${channelCount[0]!.n}  messages=${messageCount[0]!.n}  created=${o.createdAt.toISOString()}`,
			)
		}
	}
}).pipe(Effect.provide(DatabaseLive), Effect.provide(Logger.layer([Logger.consolePretty()])))

Effect.runPromise(program as Effect.Effect<void>)
