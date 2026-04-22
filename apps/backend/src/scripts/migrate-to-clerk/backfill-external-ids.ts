/**
 * Cutover script — rewrites `users.externalId` from WorkOS user IDs to Clerk
 * user IDs using the NDJSON mapping emitted by the clerk/migration-tool.
 *
 * Run this DURING the cutover window (app paused → run → deploy new code).
 * See plan Phase G for the full runbook.
 *
 * Usage:
 *   DATABASE_URL=… bun run src/scripts/migrate-to-clerk/backfill-external-ids.ts
 *   DATABASE_URL=… bun run src/scripts/migrate-to-clerk/backfill-external-ids.ts --dry-run
 *   DATABASE_URL=… bun run src/scripts/migrate-to-clerk/backfill-external-ids.ts --force  # skip mismatch check
 *
 * Input:
 *   ./exports/import-log.ndjson — each line: { userId: <workosId>, status: "success", clerkUserId: <clerkId> }
 *
 * Idempotency: safe to re-run. The UPDATE only matches rows whose current
 * externalId is still the old WorkOS ID. Once rewritten to the Clerk ID,
 * subsequent runs become no-ops.
 */

import { Database, and, eq, isNull, schema } from "@hazel/db"
import { Effect, Layer, Logger } from "effect"
import { DatabaseLive } from "../../services/database"

const LOG_PATH = "./exports/import-log.ndjson"

const args = new Set(process.argv.slice(2))
const dryRun = args.has("--dry-run")
const force = args.has("--force")

type LogEntry = { userId: string; status: string; clerkUserId?: string }

const program = Effect.gen(function* () {
	const db = yield* Database.Database

	const raw = yield* Effect.promise(() => Bun.file(LOG_PATH).text())
	const mapping: Array<{ workosId: string; clerkId: string }> = []
	for (const line of raw.split("\n")) {
		if (!line.trim()) continue
		const entry = JSON.parse(line) as LogEntry
		if (entry.status === "success" && entry.clerkUserId) {
			mapping.push({ workosId: entry.userId, clerkId: entry.clerkUserId })
		}
	}

	yield* Effect.log(`Loaded ${mapping.length} WorkOS → Clerk ID mappings from ${LOG_PATH}`)

	// Pre-flight: count active users in the DB. If it's > mapping.length, some
	// users have no Clerk equivalent (import failures or users created post-export).
	const allActive = yield* db.makeQuery((execute, _data: {}) =>
		execute((client) =>
			client
				.select({ id: schema.usersTable.id, externalId: schema.usersTable.externalId })
				.from(schema.usersTable)
				.where(isNull(schema.usersTable.deletedAt)),
		),
	)({})

	yield* Effect.log(`Active users in DB: ${allActive.length}`)

	const workosIdSet = new Set(mapping.map((m) => m.workosId))
	const orphans = allActive.filter(
		(u) => !workosIdSet.has(u.externalId) && !u.externalId.startsWith("user_") /* generic */,
	)
	// A stricter orphan check: any active user whose externalId still matches the
	// WorkOS shape but isn't in the mapping.
	const workosShape = /^user_01[A-Z0-9]{24}$/
	const unmatched = allActive.filter(
		(u) => workosShape.test(u.externalId) && !workosIdSet.has(u.externalId),
	)

	if (unmatched.length > 0) {
		yield* Effect.logWarning(
			`${unmatched.length} active users have WorkOS-shaped externalIds not present in the import log:`,
		)
		for (const u of unmatched.slice(0, 10)) {
			yield* Effect.logWarning(`  - user.id=${u.id} externalId=${u.externalId}`)
		}
		if (!force) {
			yield* Effect.fail(
				new Error(
					`${unmatched.length} unmatched users. Re-run delta export + import, or pass --force to proceed anyway.`,
				),
			)
		}
	}

	if (dryRun) {
		yield* Effect.log(
			`[dry-run] Would UPDATE ${mapping.length} rows. No changes made.`,
		)
		return
	}

	// Apply updates in a single transaction. Each UPDATE matches by the current
	// externalId (= WorkOS ID); if a row has already been rewritten, the WHERE
	// fails to match and the UPDATE is a no-op. Only touches non-deleted rows.
	yield* Effect.log(`Applying ${mapping.length} updates…`)

	const updated = yield* db.transaction(
		Effect.gen(function* () {
			let touched = 0
			for (const { workosId, clerkId } of mapping) {
				const result = yield* db.makeQuery(
					(execute, args: { workosId: string; clerkId: string }) =>
						execute((client) =>
							client
								.update(schema.usersTable)
								.set({ externalId: args.clerkId, updatedAt: new Date() })
								.where(
									and(
										eq(schema.usersTable.externalId, args.workosId),
										isNull(schema.usersTable.deletedAt),
									),
								)
								.returning({ id: schema.usersTable.id }),
						),
				)({ workosId, clerkId })
				touched += result.length
			}
			return touched
		}),
	)

	yield* Effect.log(`Updated ${updated} rows.`)

	// Post-flight sanity check.
	const remaining = yield* db.makeQuery((execute, _data: {}) =>
		execute((client) =>
			client
				.select({ count: schema.usersTable.id })
				.from(schema.usersTable)
				.where(isNull(schema.usersTable.deletedAt)),
		),
	)({})
	const clerkShape = /^user_[A-Za-z0-9]{27}$/
	const afterAll = yield* db.makeQuery((execute, _data: {}) =>
		execute((client) =>
			client
				.select({ id: schema.usersTable.id, externalId: schema.usersTable.externalId })
				.from(schema.usersTable)
				.where(isNull(schema.usersTable.deletedAt)),
		),
	)({})

	const stillWorkOS = afterAll.filter((u) => workosShape.test(u.externalId))
	const properlyClerk = afterAll.filter((u) => clerkShape.test(u.externalId))

	yield* Effect.log(
		`Post-migration: total=${remaining.length} clerk-shaped=${properlyClerk.length} still-workos=${stillWorkOS.length}`,
	)

	if (stillWorkOS.length > 0) {
		yield* Effect.logWarning(
			`${stillWorkOS.length} users still have WorkOS-shaped externalIds — investigate before re-opening writes.`,
		)
	}
}).pipe(
	Effect.provide(DatabaseLive),
	Effect.provide(Logger.layer([Logger.consolePretty()])),
)

Effect.runPromise(program as Effect.Effect<void>)
