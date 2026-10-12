/**
 * Merge Clerk-webhook-created ghost orgs back into the original WorkOS-era rows.
 *
 * Criteria for a "ghost" row (what we delete):
 *   - settings.clerkOrganizationId IS set          (came from Clerk webhook insert)
 *   - 0 channels AND 0 messages                    (no real data on it)
 *
 * Criteria for the "canonical" row (what we keep):
 *   - Same lowercased name as the ghost
 *   - Has channels or messages (i.e. the real org)
 *   - Its clerkOrganizationId is NULL or matches the ghost's
 *     (NULL = pre-migration WorkOS row; match = a previous merge / webhook back-link
 *     already stamped it. A different non-NULL value means the row is bound to a
 *     different Clerk org — skip, that's not a duplicate, that's two real orgs.)
 *
 * If multiple canonical candidates exist for one ghost, we skip that group
 * and log a warning — needs manual review. If the ghost has non-zero data
 * we skip too (the "obvious" merge is unsafe).
 *
 * The merge itself:
 *   - Sets canonical.settings.clerkOrganizationId = ghost's
 *   - If canonical.logoUrl is null, copies the ghost's logoUrl across
 *   - Deletes ghost's organization_members rows (webhook will recreate them
 *     now that canonical has the Clerk org ID)
 *   - Hard-deletes the ghost org row
 *
 * Usage:
 *   IS_DEV=false bun run src/scripts/migrate-to-clerk/merge-org-duplicates.ts --dry-run
 *   IS_DEV=false bun run src/scripts/migrate-to-clerk/merge-org-duplicates.ts
 */

import { Database, PG, schema } from "@hazel/db"
import { Effect, Logger, Schema } from "effect"
import { DatabaseLive } from "../../services/database"

const dryRun = process.argv.includes("--dry-run")

const program = Effect.gen(function* () {
	const db = yield* Database.Database

	const orgs = yield* db.run(
		PG.from(schema.organizationsTable)
			.select("id", "name", "slug", "logoUrl", "settings", "createdAt")
			.where(($) => [$.deletedAt.isNull()]),
	)

	// Count channels + messages per org in one pass.
	const counts = yield* db.query(
		Database.sql`
			select
				o.id as org_id,
				(select count(*)::int from channels where "organizationId" = o.id and "deletedAt" is null) as channel_count,
				(select count(*)::int from messages m join channels c on c.id = m."channelId" where c."organizationId" = o.id) as message_count,
				(select count(*)::int from organization_members where "organizationId" = o.id and "deletedAt" is null) as member_count
			from organizations o
			where o."deletedAt" is null
		`,
		Schema.Struct({
			org_id: Schema.String,
			channel_count: Schema.Number,
			message_count: Schema.Number,
			member_count: Schema.Number,
		}),
	)

	const statsById = new Map(counts.map((c) => [c.org_id, c]))

	type Enriched = (typeof orgs)[number] & {
		channelCount: number
		messageCount: number
		memberCount: number
		clerkOrgId: string | null
	}

	const enriched: Enriched[] = orgs.map((o) => {
		const stats = statsById.get(o.id) ?? { channel_count: 0, message_count: 0, member_count: 0 }
		const clerkOrgId = ((o.settings as any)?.clerkOrganizationId ?? null) as string | null
		return {
			...o,
			channelCount: stats.channel_count,
			messageCount: stats.message_count,
			memberCount: stats.member_count,
			clerkOrgId,
		}
	})

	const byName = new Map<string, Enriched[]>()
	for (const o of enriched) {
		const key = o.name.trim().toLowerCase()
		const list = byName.get(key) ?? []
		list.push(o)
		byName.set(key, list)
	}

	type Merge = { canonical: Enriched; ghost: Enriched }
	const merges: Merge[] = []
	const skipped: Array<{ name: string; reason: string }> = []

	for (const [name, list] of byName) {
		if (list.length < 2) continue

		const ghosts = list.filter(
			(o) => o.clerkOrgId !== null && o.channelCount === 0 && o.messageCount === 0,
		)
		if (ghosts.length === 0) continue

		for (const ghost of ghosts) {
			const canonicalCandidates = list.filter(
				(o) =>
					o.id !== ghost.id &&
					(o.channelCount > 0 || o.messageCount > 0) &&
					(o.clerkOrgId === null || o.clerkOrgId === ghost.clerkOrgId),
			)
			if (canonicalCandidates.length === 0) {
				skipped.push({
					name,
					reason: `no row with channels/messages and matching (or null) clerkOrganizationId to merge ghost ${ghost.id} into`,
				})
				continue
			}
			if (canonicalCandidates.length > 1) {
				skipped.push({
					name,
					reason: `${canonicalCandidates.length} candidate canonical rows — manual merge required`,
				})
				continue
			}
			merges.push({ canonical: canonicalCandidates[0]!, ghost })
		}
	}

	yield* Effect.log(
		`Orgs: ${orgs.length} | Groups with dupes: ${
			[...byName.values()].filter((l) => l.length > 1).length
		} | Planned merges: ${merges.length} | Skipped: ${skipped.length}`,
	)

	for (const { canonical, ghost } of merges) {
		yield* Effect.log(
			`  MERGE "${canonical.name}": keep id=${canonical.id} slug=${canonical.slug} (channels=${canonical.channelCount} messages=${canonical.messageCount} members=${canonical.memberCount}) <- ghost id=${ghost.id} slug=${ghost.slug} clerkOrgId=${ghost.clerkOrgId} members=${ghost.memberCount} logoUrl=${ghost.logoUrl ? "set" : "null"}`,
		)
	}

	for (const s of skipped) {
		yield* Effect.logWarning(`  SKIP "${s.name}": ${s.reason}`)
	}

	if (merges.length === 0) {
		yield* Effect.log("Nothing to merge.")
		return
	}

	if (dryRun) {
		yield* Effect.log(`[dry-run] No changes made.`)
		return
	}

	yield* Effect.log(`\nApplying ${merges.length} merges…`)
	yield* db.transaction(
		Effect.gen(function* () {
			for (const { canonical, ghost } of merges) {
				const mergedSettings = {
					...((canonical.settings as any) ?? {}),
					clerkOrganizationId: ghost.clerkOrgId,
				}

				yield* db.run(
					PG.update(schema.organizationsTable)
						.set({
							settings: mergedSettings,
							...(!canonical.logoUrl && ghost.logoUrl ? { logoUrl: ghost.logoUrl } : {}),
							updatedAt: new Date(),
						})
						.where(($) => [$.id.eq(canonical.id)]),
				)

				// Remove the ghost's membership rows — the next webhook fire on the
				// canonical (now correctly keyed by clerkOrgId) will re-sync real members.
				yield* db.run(
					PG.deleteFrom(schema.organizationMembersTable).where(($) => [
						$.organizationId.eq(ghost.id),
					]),
				)

				// Drop the ghost row itself (hard delete — it has no channels/messages).
				yield* db.run(PG.deleteFrom(schema.organizationsTable).where(($) => [$.id.eq(ghost.id)]))

				yield* Effect.log(`  ✓ merged ghost ${ghost.id} into ${canonical.id} (${canonical.name})`)
			}
		}),
	)

	yield* Effect.log(`\nDone. Merged ${merges.length} org(s).`)
}).pipe(Effect.provide(DatabaseLive), Effect.provide(Logger.layer([Logger.consolePretty()])))

Effect.runPromise(program as Effect.Effect<void>)
