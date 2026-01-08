import { test as setup, expect } from "@playwright/test"
import * as fs from "fs"

const authFile = "e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
	// Skip if valid auth state already exists
	if (fs.existsSync(authFile)) {
		const stats = fs.statSync(authFile)
		// Check if file has content (not empty) and is less than 24 hours old
		if (stats.size > 100) {
			const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60)
			if (ageHours < 24) {
				console.log("✅ Using existing auth state (less than 24h old)")
				return
			}
		}
	}

	// Go to the app - it will redirect to login
	await page.goto("/onboarding")

	// Wait for WorkOS login page
	await page.waitForURL(/authkit\.app|workos\.com/)

	// Fill in test user email
	await page.getByLabel("Email").fill(process.env.TEST_USER_EMAIL!)
	await page.getByRole("button", { name: /continue/i }).click()

	// Check if we get password field or OTP verification
	const passwordField = page.getByLabel("Password")
	const otpPage = page.waitForURL(/email-verification/, { timeout: 5000 }).catch(() => null)

	// Try password auth first
	try {
		await passwordField.waitFor({ timeout: 5000 })
		await passwordField.fill(process.env.TEST_USER_PASSWORD!)
		await page.getByRole("button", { name: /continue|sign in/i }).click()
	} catch {
		// If no password field, we're on OTP flow
		await otpPage
		console.log("\n\n=== MANUAL ACTION REQUIRED ===")
		console.log("Please enter the 6-digit OTP code sent to your email")
		console.log("The test will wait up to 2 minutes for you to complete this step")
		console.log("==============================\n\n")
	}

	// Handle organization selection if presented
	try {
		// Wait briefly for potential org selection page
		await page.waitForURL(/organization-selection/, { timeout: 5000 })
		console.log("Organization selection page detected, selecting first org...")
		// Click the first organization in the list
		await page.locator("button, [role='button'], a").filter({ hasText: "Test Org" }).first().click()
	} catch {
		// No org selection needed, continue
	}

	// Wait for redirect back to app (2 minute timeout for manual OTP entry if needed)
	// Match localhost with any port in the 3000 range
	await page.waitForURL(/localhost:300\d/, { timeout: 120000 })

	// Save auth state
	await page.context().storageState({ path: authFile })
})
