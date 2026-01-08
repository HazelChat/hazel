import { expect, test } from "@playwright/test"

test.describe("Onboarding Flow", () => {
	test("completes full creator onboarding with team size button verification", async ({ page }) => {
		const uniqueSlug = `test-org-${Date.now()}`

		await page.goto("/onboarding")

		// Wait for the app to fully load (may take time for Electric SQL sync)
		await page.waitForLoadState("networkidle", { timeout: 30000 })

		// Step 1: Welcome
		await expect(page.getByTestId("onboarding-step-welcome")).toBeVisible({ timeout: 30000 })
		await page.getByTestId("onboarding-continue-btn").click()

		// Step 2: Profile Info
		await expect(page.getByTestId("onboarding-step-profile")).toBeVisible()
		await page.getByTestId("input-first-name").fill("Test")
		await page.getByTestId("input-last-name").fill("User")
		await page.getByTestId("onboarding-continue-btn").click()

		// Step 3: Timezone
		await expect(page.getByTestId("onboarding-step-timezone")).toBeVisible()
		await page.getByTestId("onboarding-continue-btn").click()

		// Step 4: Theme
		await expect(page.getByTestId("onboarding-step-theme")).toBeVisible()
		await page.getByTestId("onboarding-continue-btn").click()

		// Step 5: Organization Setup
		await expect(page.getByTestId("onboarding-step-org")).toBeVisible()
		await page.getByTestId("input-org-name").fill("Test Org")
		await page.getByTestId("input-org-slug").fill(uniqueSlug)
		await expect(page.getByTestId("onboarding-continue-btn")).toBeEnabled({ timeout: 10000 })
		await page.getByTestId("onboarding-continue-btn").click()

		// Wait for org step to disappear (indicates transition started)
		await expect(page.getByTestId("onboarding-step-org")).not.toBeVisible({ timeout: 30000 })

		// Step 6: Team Size (useCases) - THE BUG FIX TEST
		await expect(page.getByTestId("onboarding-step-team-size")).toBeVisible({ timeout: 15000 })

		// BUG FIX VERIFICATION: Continue button should be disabled initially (no selection)
		await expect(page.getByTestId("onboarding-continue-btn")).toBeDisabled()

		// Select team size
		await page.getByTestId("team-size-small").click()

		// BUG FIX VERIFICATION: Continue should now be enabled
		await expect(page.getByTestId("onboarding-continue-btn")).toBeEnabled()

		// BUG FIX VERIFICATION: Click and verify navigation works (this used to not work)
		await page.getByTestId("onboarding-continue-btn").click()

		// Step 7: Role
		await expect(page.getByTestId("onboarding-step-role")).toBeVisible()
		await page.getByTestId("role-developer").click()
		await page.getByTestId("onboarding-continue-btn").click()

		// Step 8: Team Invitation
		await expect(page.getByTestId("onboarding-step-invite")).toBeVisible()
		await page.getByTestId("onboarding-continue-btn").click() // Skip for now

		// Step 9: Finalization - should redirect to the new org
		await expect(page).toHaveURL(new RegExp(`/${uniqueSlug}`), { timeout: 15000 })
	})
})
