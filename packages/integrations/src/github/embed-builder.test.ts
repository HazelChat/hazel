import { describe, expect, it, afterEach, beforeEach } from "@effect/vitest"
import { vi } from "vitest"
import { testPayloads } from "./__fixtures__/payloads"
import { GITHUB_COLORS } from "./colors"
import { buildIssueEmbed, buildPullRequestEmbed, buildPushEmbed, buildReleaseEmbed } from "./embed-builder"

describe("GitHub embed builder", () => {
	const fixedNow = new Date("2025-01-01T00:00:00.000Z")

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(fixedNow)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("builds push embed for a single commit", () => {
		const embed = buildPushEmbed(testPayloads.push_single)
		expect(embed).not.toBeNull()
		expect(embed?.title).toBe("octocat/hello-world")
		expect(embed?.badge?.text).toBe("Push")
		expect(embed?.description).toBe("**1** commit pushed to [[main]]")
		expect(embed?.timestamp).toBe(fixedNow.toISOString())
	})

	it("builds push embed for branch creation", () => {
		const embed = buildPushEmbed(testPayloads.push_branch_created)
		expect(embed).not.toBeNull()
		expect(embed?.badge?.text).toBe("Branch Created")
		expect(embed?.description).toBe("Branch **feature/new-api** created")
	})

	it("builds push embed for tag creation", () => {
		const embed = buildPushEmbed(testPayloads.push_tag_created)
		expect(embed).not.toBeNull()
		expect(embed?.badge?.text).toBe("Tag Created")
		expect(embed?.description).toBe("Tag **v1.0.0** created")
	})

	it("caps commit list fields to 5 items", () => {
		const payload = {
			...testPayloads.push_multiple,
			commits: Array.from({ length: 7 }).map((_, index) => ({
				id: `commit-${index}`.padEnd(40, "0"),
				message: `feat: change ${index}`,
			})),
		}

		const embed = buildPushEmbed(payload)
		expect(embed?.fields?.length).toBe(5)
	})

	it("builds pull request embed with merged badge", () => {
		const embed = buildPullRequestEmbed(testPayloads.pr_merged)
		expect(embed.badge?.text).toBe("Merged")
		expect(embed.color).toBe(GITHUB_COLORS.pr_merged)
		expect(embed.title).toBe("#41 Fix database connection pooling")
	})

	it("builds pull request embed with labels and diff stats", () => {
		const embed = buildPullRequestEmbed(testPayloads.pr_opened)
		const fieldNames = embed.fields?.map((field) => field.name) ?? []
		expect(embed.badge?.text).toBe("Opened")
		expect(fieldNames).toContain("Diff")
		expect(fieldNames).toContain("Labels")
	})

	it("builds issue embed with labels", () => {
		const embed = buildIssueEmbed(testPayloads.issue_opened)
		const labelsField = embed.fields?.find((field) => field.name === "Labels")
		expect(embed.badge?.text).toBe("Opened")
		expect(labelsField?.value).toContain("bug")
	})

	it("builds release embed with tag fallback", () => {
		const embed = buildReleaseEmbed(testPayloads.release_published)
		expect(embed.title).toBe("Version 2.0.0")
		expect(embed.color).toBe(GITHUB_COLORS.release)
	})
})
