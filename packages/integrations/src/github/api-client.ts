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
export const parseGitHubPRUrl = (url: string): { owner: string; repo: string; number: number } | null => {
	const match = url.match(GITHUB_PR_URL_REGEX)
	if (!match || !match[1] || !match[2] || !match[3]) return null
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

// Type for GitHub PR API response
interface GitHubPRApiResponse {
	number: number
	title: string
	body: string | null
	state: string
	draft?: boolean
	merged?: boolean
	user?: { login: string; avatar_url?: string }
	additions?: number
	deletions?: number
	head?: { ref: string }
	updated_at?: string
	labels?: Array<{ name: string; color: string }>
}

// Type for not found response
interface NotFoundResponse {
	notFound: true
	owner: string
	repo: string
	number: number
}

/**
 * Fetch a GitHub PR by owner, repo, and number using the provided access token
 */
export const fetchGitHubPR = Effect.fn("GitHub.fetchGitHubPR")(function* (
	owner: string,
	repo: string,
	prNumber: number,
	accessToken: string,
) {
	const response = yield* Effect.tryPromise({
		try: async (): Promise<GitHubPRApiResponse | NotFoundResponse> => {
			const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			})

			if (!res.ok) {
				const errorBody = (await res.json().catch(() => ({ message: "Unknown error" }))) as {
					message?: string
				}
				const message = parseGitHubErrorMessage(res.status, errorBody.message || "Unknown error")

				if (res.status === 404) {
					return { notFound: true, owner, repo, number: prNumber }
				}

				throw new Error(message)
			}

			return res.json() as Promise<GitHubPRApiResponse>
		},
		catch: (error) =>
			new GitHubApiError({
				message: error instanceof Error ? error.message : "Could not connect to GitHub",
				cause: error,
			}),
	})

	// Check for not found
	if ("notFound" in response && response.notFound) {
		return yield* Effect.fail(
			new GitHubPRNotFoundError({
				owner: response.owner,
				repo: response.repo,
				number: response.number,
			}),
		)
	}

	const prResponse = response as GitHubPRApiResponse

	// Transform the response
	return {
		owner,
		repo,
		number: prResponse.number,
		title: prResponse.title,
		body: prResponse.body ?? null,
		state: prResponse.state as "open" | "closed",
		draft: prResponse.draft ?? false,
		merged: prResponse.merged ?? false,
		author: prResponse.user
			? {
					login: prResponse.user.login,
					avatarUrl: prResponse.user.avatar_url ?? null,
				}
			: null,
		additions: prResponse.additions ?? 0,
		deletions: prResponse.deletions ?? 0,
		headRefName: prResponse.head?.ref ?? "",
		updatedAt: prResponse.updated_at ?? new Date().toISOString(),
		labels: (prResponse.labels ?? []).map((label) => ({
			name: label.name,
			color: label.color,
		})),
	}
})
