import { describe, expect, it } from "@effect/vitest"
import { isGitHubPRUrl, parseGitHubPRUrl } from "./api-client"

describe("GitHub API client URL parsing", () => {
	describe("parseGitHubPRUrl", () => {
		it("parses standard PR URLs", () => {
			expect(parseGitHubPRUrl("https://github.com/foo/bar/pull/123")).toEqual({
				owner: "foo",
				repo: "bar",
				number: 123,
			})
		})

		it("parses PR URLs with extra paths", () => {
			expect(parseGitHubPRUrl("https://github.com/foo/bar/pull/123/files")).toEqual({
				owner: "foo",
				repo: "bar",
				number: 123,
			})
		})

		it("rejects non-PR URLs", () => {
			expect(parseGitHubPRUrl("https://github.com/foo/bar/issues/123")).toBeNull()
			expect(parseGitHubPRUrl("https://example.com/foo/bar/pull/123")).toBeNull()
		})

		it("rejects invalid owner or repo names", () => {
			expect(parseGitHubPRUrl("https://github.com/invalid!/repo/pull/1")).toBeNull()
			expect(parseGitHubPRUrl("https://github.com/owner/invalid%20repo/pull/1")).toBeNull()
		})

		it("rejects invalid PR numbers", () => {
			expect(parseGitHubPRUrl("https://github.com/foo/bar/pull/0")).toBeNull()
			expect(parseGitHubPRUrl("https://github.com/foo/bar/pull/NaN")).toBeNull()
		})
	})

	describe("isGitHubPRUrl", () => {
		it("detects PR URLs", () => {
			expect(isGitHubPRUrl("https://github.com/foo/bar/pull/123")).toBe(true)
			expect(isGitHubPRUrl("https://github.com/foo/bar/pull/123/commits")).toBe(true)
		})

		it("returns false for non-PR URLs", () => {
			expect(isGitHubPRUrl("https://github.com/foo/bar/issues/123")).toBe(false)
			expect(isGitHubPRUrl("https://example.com/foo/bar/pull/123")).toBe(false)
		})
	})
})
