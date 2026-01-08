import { stopTestInfrastructure } from "./test-infrastructure"

export default async function globalTeardown() {
	console.log("\n========================================")
	console.log(" Cleaning up test environment")
	console.log("========================================\n")

	try {
		await stopTestInfrastructure()

		console.log("\n========================================")
		console.log(" Cleanup complete!")
		console.log("========================================\n")
	} catch (error) {
		console.error("\n========================================")
		console.error(" Cleanup failed (non-fatal)")
		console.error("========================================")
		console.error(error)
		// Don't throw - cleanup failures shouldn't fail the test run
	}
}
