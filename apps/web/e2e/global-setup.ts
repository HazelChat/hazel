import { existsSync, unlinkSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { startTestInfrastructure } from "./test-infrastructure"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function globalSetup() {
	// Delete cached auth state - each test run has a fresh database,
	// so we need to re-authenticate to create the user
	const authFile = join(__dirname, ".auth/user.json")
	if (existsSync(authFile)) {
		console.log("  Clearing cached auth state (fresh database requires re-auth)")
		unlinkSync(authFile)
	}
	console.log("\n========================================")
	console.log(" Starting isolated test environment")
	console.log("========================================\n")

	try {
		const infrastructure = await startTestInfrastructure()

		console.log("\n========================================")
		console.log(" Test environment ready!")
		console.log("========================================")
		console.log(`  PostgreSQL: ${infrastructure.databaseUrl}`)
		console.log(`  Redis: ${infrastructure.redisUrl}`)
		console.log(`  Electric: ${infrastructure.electricUrl}`)
		console.log(`  Backend: http://localhost:3003`)
		console.log(`  Frontend: http://localhost:3000`)
		console.log("========================================\n")
	} catch (error) {
		console.error("\n========================================")
		console.error(" Failed to start test environment!")
		console.error("========================================")
		console.error(error)
		throw error
	}
}
