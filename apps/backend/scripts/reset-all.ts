#!/usr/bin/env bun

import { Database } from "@hazel/db"
import { WorkOSClient } from "@hazel/backend-core"
import { Effect, Logger, LogLevel } from "effect"
import { DatabaseLive } from "../src/services/database"

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const isForce = args.includes("--force")

// ANSI color codes
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	bold: "\x1b[1m",
}

const log = (color: keyof typeof colors, message: string) => {
	console.log(`${colors[color]}${message}${colors.reset}`)
}

// Database tables in deletion order (respects foreign keys)
const dependentTables = [
	"message_reactions",
	"pinned_messages",
	"typing_indicators",
	"attachments",
	"messages",
	"channel_members",
	"notifications",
	"invitations",
	"organization_members",
	"user_presence_status",
	"bots",
] as const

const mainTables = ["channels", "organizations", "users"] as const

const allTables = [...dependentTables, ...mainTables] as const

// Database clearing logic
const clearDatabase = Effect.gen(function* () {
	const db = yield* Database.Database
	const tableCounts: Record<string, number> = {}

	log("cyan", `\n${"=".repeat(50)}`)
	log("cyan", "DATABASE CLEARING")
	log("cyan", `${"=".repeat(50)}`)

	for (const table of allTables) {
		// Count rows before deletion
		const countResult = yield* db
			.execute((client) => client.$client`SELECT COUNT(*)::int as count FROM ${client.$client(table)}`)
			.pipe(Effect.orDie)
		const count = (countResult[0] as { count: number } | undefined)?.count ?? 0
		tableCounts[table] = count

		if (count === 0) {
			log("white", `  ⊘ ${table}: already empty`)
			continue
		}

		if (isDryRun) {
			log("yellow", `  [DRY RUN] Would delete ${count} rows from ${table}`)
		} else {
			yield* db
				.execute((client) => client.$client`TRUNCATE TABLE ${client.$client(table)} CASCADE`)
				.pipe(Effect.orDie)
			log("green", `  ✓ Cleared ${count} rows from ${table}`)
		}
	}

	return tableCounts
})

// WorkOS clearing logic
const clearWorkOS = Effect.gen(function* () {
	const workos = yield* WorkOSClient

	log("magenta", `\n${"=".repeat(50)}`)
	log("magenta", "WORKOS CLEARING")
	log("magenta", `${"=".repeat(50)}`)

	const counts = {
		invitations: 0,
		organizations: 0,
		users: 0,
	}

	// 1. Clear invitations
	log("blue", "\n  → Clearing invitations...")
	const invitations = yield* workos.call((client) => client.userManagement.listInvitations({ limit: 100 }))

	counts.invitations = invitations.data.filter((invitation) => invitation.state === "pending").length

	if (counts.invitations === 0) {
		log("white", "  ⊘ No invitations to delete")
	} else {
		for (const invitation of invitations.data) {
			if (isDryRun) {
				log("yellow", `  [DRY RUN] Would delete invitation: ${invitation.email}`)
			} else {
				yield* workos.call((client) => client.userManagement.revokeInvitation(invitation.id))
				log("green", `  ✓ Deleted invitation: ${invitation.email}`)
			}
		}
	}

	// 2. Clear organizations (this will cascade to memberships)
	log("blue", "\n  → Clearing organizations...")
	const organizations = yield* workos.call((client) =>
		client.organizations.listOrganizations({ limit: 100 }),
	)

	// Filter out "TTest Organization - it should be preserved
	const orgsToDelete = organizations.data.filter((org) => org.name !== "Test Organization")
	const skippedOrgs = organizations.data.filter((org) => org.name === "Test Organization")

	if (skippedOrgs.length > 0) {
		log(
			"white",
			`  ⊘ Skipping ${skippedOrgs.length} protected organization(s): ${skippedOrgs.map((o) => o.name).join(", ")}`,
		)
	}

	counts.organizations = orgsToDelete.length

	if (counts.organizations === 0) {
		log("white", "  ⊘ No organizations to delete")
	} else {
		for (const org of orgsToDelete) {
			if (isDryRun) {
				log("yellow", `  [DRY RUN] Would delete organization: ${org.name}`)
			} else {
				yield* workos.call((client) => client.organizations.deleteOrganization(org.id))
				log("green", `  ✓ Deleted organization: ${org.name}`)
			}
		}
	}

	// 3. Clear users
	log("blue", "\n  → Clearing users...")
	const users = yield* workos.call((client) => client.userManagement.listUsers({ limit: 100 }))

	counts.users = users.data.length

	if (counts.users === 0) {
		log("white", "  ⊘ No users to delete")
	} else {
		for (const user of users.data) {
			if (isDryRun) {
				log(
					"yellow",
					`  [DRY RUN] Would delete user: ${user.email} (${user.firstName} ${user.lastName})`,
				)
			} else {
				yield* workos.call((client) => client.userManagement.deleteUser(user.id))
				log("green", `  ✓ Deleted user: ${user.email}`)
			}
		}
	}

	return counts
})

// Main script
const resetScript = Effect.gen(function* () {
	// Print banner
	log("bold", `\n${"=".repeat(50)}`)
	log("bold", "RESET SCRIPT - DATABASE & WORKOS")
	log("bold", `${"=".repeat(50)}`)

	if (isDryRun) {
		log("yellow", "\n⚠️  DRY RUN MODE - No changes will be made")
	}

	// Environment check
	const dbUrl = process.env.DATABASE_URL ?? ""
	if (dbUrl.includes("production") || dbUrl.includes("prod")) {
		log("red", "\n⛔ ERROR: This script cannot run in production!")
		log("red", "Please run against a development or test database.")
		return yield* Effect.die("Cannot run in production")
	}

	// Confirmation prompt
	if (!isForce && !isDryRun) {
		log("red", "\n⚠️  WARNING: This will delete ALL data from:")
		log("red", "  • All database tables (users, orgs, messages, etc.)")
		log("red", "  • All WorkOS data (users, organizations, invitations)")
		log("white", "\nThis action cannot be undone!")

		const readline = require("node:readline").createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		const answer = yield* Effect.promise(() => {
			return new Promise<string>((resolve) => {
				readline.question(
					`\n${colors.yellow}Type 'DELETE ALL' to confirm: ${colors.reset}`,
					(ans: string) => {
						readline.close()
						resolve(ans)
					},
				)
			})
		})

		if (answer !== "DELETE ALL") {
			log("blue", "\n✓ Cancelled - no changes made")
			return
		}
	}

	// Execute clearing operations
	const startTime = Date.now()

	const dbCounts = yield* clearDatabase
	const workOSCounts = yield* clearWorkOS

	const duration = ((Date.now() - startTime) / 1000).toFixed(2)

	// Print summary
	log("bold", `\n${"=".repeat(50)}`)
	log("bold", "SUMMARY")
	log("bold", `${"=".repeat(50)}`)

	log("cyan", "\nDatabase Tables:")
	const totalDbRows = Object.values(dbCounts).reduce((sum, count) => sum + count, 0)
	log("white", `  Total rows ${isDryRun ? "to delete" : "deleted"}: ${totalDbRows}`)
	for (const [table, count] of Object.entries(dbCounts)) {
		if (count > 0) {
			log("white", `    • ${table}: ${count}`)
		}
	}

	log("magenta", "\nWorkOS:")
	log("white", `  Invitations ${isDryRun ? "to delete" : "deleted"}: ${workOSCounts.invitations}`)
	log("white", `  Organizations ${isDryRun ? "to delete" : "deleted"}: ${workOSCounts.organizations}`)
	log("white", `  Users ${isDryRun ? "to delete" : "deleted"}: ${workOSCounts.users}`)

	log("green", `\n✓ Completed in ${duration}s`)

	if (isDryRun) {
		log("yellow", "\n💡 Run without --dry-run to actually delete the data")
	}
})

// Run the script with proper Effect runtime
const runnable = resetScript.pipe(
	Effect.provide(DatabaseLive),
	Effect.provide(WorkOSClient.Default),
	Effect.provide(Logger.minimumLogLevel(LogLevel.Info)),
)

Effect.runPromise(runnable).catch((error) => {
	log("red", `\n✗ Script failed: ${error}`)
	process.exit(1)
})
