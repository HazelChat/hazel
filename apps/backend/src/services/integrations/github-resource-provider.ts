import { Data, Effect, Schema } from "effect"

/**
 * GitHub PR URL patterns:
 * - https://github.com/{owner}/{repo}/pull/{number}
 * - https://github.com/{owner}/{repo}/pull/{number}/files
 * - https://github.com/{owner}/{repo}/pull/{number}/commits
 */
const GITHUB_PR_URL_REGEX = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i

// Schema for GitHub PR author
export const GitHubPRAuthor = Schema.Struct({
	login: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
})

// Schema for GitHub PR label
export const GitHubPRLabel = Schema.Struct({
	name: Schema.String,
	color: Schema.String,
})

// Full GitHub PR schema
export const GitHubPR = Schema.Struct({
	owner: Schema.String,
	repo: Schema.String,
	number: Schema.Number,
	title: Schema.String,
	body: Schema.NullOr(Schema.String),
	state: Schema.Literal("open", "closed"),
	draft: Schema.Boolean,
	merged: Schema.Boolean,
	author: Schema.NullOr(GitHubPRAuthor),
	additions: Schema.Number,
	deletions: Schema.Number,
	headRefName: Schema.String,
	updatedAt: Schema.String,
	labels: Schema.Array(GitHubPRLabel),
})

export type GitHubPR = typeof GitHubPR.Type

// Error for when GitHub API request fails
export class GitHubApiError extends Data.TaggedError("GitHubApiError")<{
	readonly message: string
	readonly cause?: unknown
}> {}

// Error for when PR is not found
export class GitHubPRNotFoundError extends Data.TaggedError("GitHubPRNotFoundError")<{
	readonly owner: string
	readonly repo: string
	readonly number: number
}> {}

/**
 * Parse a GitHub PR URL to extract owner, repo, and PR number
 */
export const parseGitHubPRUrl = (
	url: string,
): { owner: string; repo: string; number: number } | null => {
	const match = url.match(GITHUB_PR_URL_REGEX)
	if (!match) return null
	return {
		owner: match[1],
		repo: match[2],
		number: Number.parseInt(match[3], 10),
	}
}

/**
 * Check if a URL is a GitHub PR URL
 */
export const isGitHubPRUrl = (url: string): boolean => {
	return GITHUB_PR_URL_REGEX.test(url)
}

/**
 * Parse GitHub API error to provide user-friendly messages
 */
const parseGitHubErrorMessage = (status: number, message: string): string => {
	const lowerMessage = message.toLowerCase()

	// Not found
	if (status === 404 || lowerMessage.includes("not found")) {
		return "Pull request not found or you don't have access"
	}

	// Authentication errors
	if (status === 401 || status === 403) {
		return "GitHub authentication failed"
	}

	// Rate limiting
	if (status === 403 && lowerMessage.includes("rate limit")) {
		return "Rate limit exceeded, try again later"
	}
	if (status === 429) {
		return "Rate limit exceeded, try again later"
	}

	// Return original message if no specific case matches
	return message
}

/**
 * Fetch a GitHub PR by owner, repo, and number using the provided access token
 */
export const fetchGitHubPR = (
	owner: string,
	repo: string,
	prNumber: number,
	accessToken: string,
): Effect.Effect<GitHubPR, GitHubApiError | GitHubPRNotFoundError> =>
	Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: async () => {
				const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					},
				})

				if (!res.ok) {
					const errorBody = await res.json().catch(() => ({ message: "Unknown error" }))
					const message = parseGitHubErrorMessage(res.status, errorBody.message || "Unknown error")

					if (res.status === 404) {
						return { notFound: true, owner, repo, number: prNumber }
					}

					throw new Error(message)
				}

				return res.json()
			},
			catch: (error) =>
				new GitHubApiError({
					message: error instanceof Error ? error.message : "Could not connect to GitHub",
					cause: error,
				}),
		})

		// Check for not found
		if (response.notFound) {
			return yield* Effect.fail(
				new GitHubPRNotFoundError({
					owner: response.owner,
					repo: response.repo,
					number: response.number,
				}),
			)
		}

		// Transform the response
		return {
			owner,
			repo,
			number: response.number,
			title: response.title,
			body: response.body ?? null,
			state: response.state as "open" | "closed",
			draft: response.draft ?? false,
			merged: response.merged ?? false,
			author: response.user
				? {
						login: response.user.login,
						avatarUrl: response.user.avatar_url ?? null,
					}
				: null,
			additions: response.additions ?? 0,
			deletions: response.deletions ?? 0,
			headRefName: response.head?.ref ?? "",
			updatedAt: response.updated_at ?? new Date().toISOString(),
			labels: (response.labels ?? []).map((label: { name: string; color: string }) => ({
				name: label.name,
				color: label.color,
			})),
		}
	})
