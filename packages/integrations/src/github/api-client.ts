import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { Effect, Schema } from "effect"

/**
 * GitHub PR URL patterns:
 * - https://github.com/{owner}/{repo}/pull/{number}
 * - https://github.com/{owner}/{repo}/pull/{number}/files
 * - https://github.com/{owner}/{repo}/pull/{number}/commits
 */
const GITHUB_PR_URL_REGEX = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i

/**
 * GitHub username/org and repo name validation pattern.
 * Allows alphanumeric, hyphens, underscores, dots (standard GitHub naming).
 */
const GITHUB_NAME_REGEX = /^[\w.-]+$/

// ============================================================================
// Domain Schemas (exported for consumers)
// ============================================================================

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

// Full GitHub PR schema (domain model)
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

// Schema for repository owner
export const GitHubRepositoryOwner = Schema.Struct({
	id: Schema.Number,
	login: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
})

export type GitHubRepositoryOwner = typeof GitHubRepositoryOwner.Type

// Schema for repository (domain model)
export const GitHubRepository = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	fullName: Schema.String,
	private: Schema.Boolean,
	htmlUrl: Schema.String,
	description: Schema.NullOr(Schema.String),
	owner: GitHubRepositoryOwner,
})

export type GitHubRepository = typeof GitHubRepository.Type

// Schema for repositories response (domain model)
export const GitHubRepositoriesResult = Schema.Struct({
	totalCount: Schema.Number,
	repositories: Schema.Array(GitHubRepository),
	hasNextPage: Schema.Boolean,
	page: Schema.Number,
	perPage: Schema.Number,
})

export type GitHubRepositoriesResult = typeof GitHubRepositoriesResult.Type

// Schema for account info (domain model)
export const GitHubAccountInfo = Schema.Struct({
	externalAccountId: Schema.String,
	externalAccountName: Schema.String,
})

export type GitHubAccountInfo = typeof GitHubAccountInfo.Type

// ============================================================================
// Error Types
// ============================================================================

// Error for when GitHub API request fails
export class GitHubApiError extends Schema.TaggedError<GitHubApiError>()("GitHubApiError", {
	message: Schema.String,
	status: Schema.optional(Schema.Number),
	cause: Schema.optional(Schema.Unknown),
}) {}

// Error for when PR is not found
export class GitHubPRNotFoundError extends Schema.TaggedError<GitHubPRNotFoundError>()(
	"GitHubPRNotFoundError",
	{
		owner: Schema.String,
		repo: Schema.String,
		number: Schema.Number,
	},
) {}

// ============================================================================
// GitHub API Response Schemas (internal, for validation)
// ============================================================================

// GitHub API PR response schema
const GitHubPRApiResponse = Schema.Struct({
	number: Schema.Number,
	title: Schema.String,
	body: Schema.NullOr(Schema.String),
	state: Schema.String,
	draft: Schema.optionalWith(Schema.Boolean, { default: () => false }),
	merged: Schema.optionalWith(Schema.Boolean, { default: () => false }),
	user: Schema.NullOr(
		Schema.Struct({
			login: Schema.String,
			avatar_url: Schema.optional(Schema.NullOr(Schema.String)),
		}),
	),
	additions: Schema.optionalWith(Schema.Number, { default: () => 0 }),
	deletions: Schema.optionalWith(Schema.Number, { default: () => 0 }),
	head: Schema.optional(Schema.Struct({ ref: Schema.String })),
	updated_at: Schema.optional(Schema.String),
	labels: Schema.optionalWith(
		Schema.Array(
			Schema.Struct({
				name: Schema.String,
				color: Schema.String,
			}),
		),
		{ default: () => [] },
	),
})

// GitHub API repository owner response schema
const GitHubRepositoryOwnerApiResponse = Schema.Struct({
	id: Schema.Number,
	login: Schema.String,
	avatar_url: Schema.optional(Schema.NullOr(Schema.String)),
})

// GitHub API repository response schema
const GitHubRepositoryApiResponse = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	full_name: Schema.String,
	private: Schema.Boolean,
	html_url: Schema.String,
	description: Schema.NullOr(Schema.String),
	owner: GitHubRepositoryOwnerApiResponse,
})

// GitHub API repositories list response schema
const GitHubRepositoriesApiResponse = Schema.Struct({
	total_count: Schema.Number,
	repositories: Schema.Array(GitHubRepositoryApiResponse),
})

// GitHub API error response schema
const GitHubErrorApiResponse = Schema.Struct({
	message: Schema.optionalWith(Schema.String, { default: () => "Unknown error" }),
})

// GitHub App info response schema
const GitHubAppApiResponse = Schema.Struct({
	id: Schema.Number,
	name: Schema.optionalWith(Schema.String, { default: () => "GitHub App" }),
})

// ============================================================================
// URL Parsing Utilities
// ============================================================================

/**
 * Parse a GitHub PR URL to extract owner, repo, and PR number.
 * Includes validation of extracted values to prevent injection attacks.
 */
export const parseGitHubPRUrl = (url: string): { owner: string; repo: string; number: number } | null => {
	const match = url.match(GITHUB_PR_URL_REGEX)
	if (!match || !match[1] || !match[2] || !match[3]) return null

	const owner = match[1]
	const repo = match[2]
	const numberStr = match[3]

	// Validate owner and repo names match GitHub naming conventions
	if (!GITHUB_NAME_REGEX.test(owner) || !GITHUB_NAME_REGEX.test(repo)) {
		return null
	}

	// Validate PR number is a positive integer
	const number = Number.parseInt(numberStr, 10)
	if (!Number.isFinite(number) || number <= 0) {
		return null
	}

	return { owner, repo, number }
}

/**
 * Check if a URL is a GitHub PR URL
 */
export const isGitHubPRUrl = (url: string): boolean => {
	return GITHUB_PR_URL_REGEX.test(url)
}

// ============================================================================
// Error Message Parsing
// ============================================================================

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

// ============================================================================
// GitHubApiClient Service
// ============================================================================

const GITHUB_API_BASE_URL = "https://api.github.com"

/**
 * GitHub API Client Service.
 *
 * Provides methods for interacting with the GitHub API using Effect HttpClient
 * with proper schema validation.
 *
 * ## Usage
 *
 * ```typescript
 * const client = yield* GitHubApiClient
 *
 * // Fetch a PR
 * const pr = yield* client.fetchPR("owner", "repo", 123, accessToken)
 *
 * // Fetch repositories
 * const repos = yield* client.fetchRepositories(accessToken, 1, 30)
 *
 * // Get account info
 * const account = yield* client.getAccountInfo(accessToken)
 * ```
 */
export class GitHubApiClient extends Effect.Service<GitHubApiClient>()("GitHubApiClient", {
	effect: Effect.gen(function* () {
		const httpClient = yield* HttpClient.HttpClient

		/**
		 * Create an authenticated client with GitHub headers
		 */
		const makeAuthenticatedClient = (accessToken: string) =>
			httpClient.pipe(
				HttpClient.mapRequest(
					HttpClientRequest.setHeaders({
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					}),
				),
			)

		/**
		 * Fetch a GitHub PR by owner, repo, and number
		 */
		const fetchPR = (
			owner: string,
			repo: string,
			prNumber: number,
			accessToken: string,
		): Effect.Effect<GitHubPR, GitHubApiError | GitHubPRNotFoundError> =>
			Effect.gen(function* () {
				const client = makeAuthenticatedClient(accessToken)
				const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}`

				const response = yield* client.get(url).pipe(Effect.scoped)

				// Handle 404 as not found error
				if (response.status === 404) {
					return yield* Effect.fail(new GitHubPRNotFoundError({ owner, repo, number: prNumber }))
				}

				// Handle other error status codes
				if (response.status >= 400) {
					const errorBody = yield* response.json.pipe(
						Effect.flatMap(Schema.decodeUnknown(GitHubErrorApiResponse)),
						Effect.catchAll((error) =>
							Effect.logDebug(`Failed to parse GitHub error response: ${String(error)}`).pipe(
								Effect.as({ message: "Unknown error" }),
							),
						),
					)
					const message = parseGitHubErrorMessage(response.status, errorBody.message)
					return yield* Effect.fail(new GitHubApiError({ message, status: response.status }))
				}

				// Parse successful response
				const prData = yield* response.json.pipe(
					Effect.flatMap(Schema.decodeUnknown(GitHubPRApiResponse)),
					Effect.mapError(
						(error) =>
							new GitHubApiError({
								message: `Failed to parse GitHub PR response: ${String(error)}`,
								cause: error,
							}),
					),
				)

				// Transform API response to domain model
				return {
					owner,
					repo,
					number: prData.number,
					title: prData.title,
					body: prData.body ?? null,
					state: prData.state as "open" | "closed",
					draft: prData.draft,
					merged: prData.merged,
					author: prData.user
						? {
								login: prData.user.login,
								avatarUrl: prData.user.avatar_url ?? null,
							}
						: null,
					additions: prData.additions,
					deletions: prData.deletions,
					headRefName: prData.head?.ref ?? "",
					updatedAt: prData.updated_at ?? new Date().toISOString(),
					labels: prData.labels.map((label) => ({
						name: label.name,
						color: label.color,
					})),
				} satisfies GitHubPR
			}).pipe(
				Effect.catchTag("RequestError", (error) =>
					Effect.fail(
						new GitHubApiError({
							message: `Network error: ${String(error)}`,
							cause: error,
						}),
					),
				),
				Effect.catchTag("ResponseError", (error) =>
					Effect.fail(
						new GitHubApiError({
							message: `Response error: ${String(error)}`,
							status: error.response.status,
							cause: error,
						}),
					),
				),
				Effect.withSpan("GitHubApiClient.fetchPR", { attributes: { owner, repo, prNumber } }),
			)

		/**
		 * Fetch repositories accessible to the GitHub App installation
		 */
		const fetchRepositories = (
			accessToken: string,
			page: number,
			perPage: number,
		): Effect.Effect<GitHubRepositoriesResult, GitHubApiError> =>
			Effect.gen(function* () {
				const client = makeAuthenticatedClient(accessToken)
				const url = `${GITHUB_API_BASE_URL}/installation/repositories?per_page=${perPage}&page=${page}`

				const response = yield* client.get(url).pipe(Effect.scoped)

				// Handle error status codes
				if (response.status >= 400) {
					const errorBody = yield* response.json.pipe(
						Effect.flatMap(Schema.decodeUnknown(GitHubErrorApiResponse)),
						Effect.catchAll(() => Effect.succeed({ message: "Unknown error" })),
					)
					return yield* Effect.fail(
						new GitHubApiError({
							message: `GitHub API error: ${errorBody.message}`,
							status: response.status,
						}),
					)
				}

				// Parse successful response
				const data = yield* response.json.pipe(
					Effect.flatMap(Schema.decodeUnknown(GitHubRepositoriesApiResponse)),
					Effect.mapError(
						(error) =>
							new GitHubApiError({
								message: `Failed to parse GitHub repositories response: ${String(error)}`,
								cause: error,
							}),
					),
				)

				// Transform API response to domain model
				const repositories: GitHubRepository[] = data.repositories.map((repo) => ({
					id: repo.id,
					name: repo.name,
					fullName: repo.full_name,
					private: repo.private,
					htmlUrl: repo.html_url,
					description: repo.description ?? null,
					owner: {
						id: repo.owner.id,
						login: repo.owner.login,
						avatarUrl: repo.owner.avatar_url ?? null,
					},
				}))

				const totalCount = data.total_count
				const hasNextPage = page * perPage < totalCount

				return {
					totalCount,
					repositories,
					hasNextPage,
					page,
					perPage,
				} satisfies GitHubRepositoriesResult
			}).pipe(
				Effect.catchTag("RequestError", (error) =>
					Effect.fail(
						new GitHubApiError({
							message: `Network error: ${String(error)}`,
							cause: error,
						}),
					),
				),
				Effect.catchTag("ResponseError", (error) =>
					Effect.fail(
						new GitHubApiError({
							message: `Response error: ${String(error)}`,
							status: error.response.status,
							cause: error,
						}),
					),
				),
				Effect.withSpan("GitHubApiClient.fetchRepositories", { attributes: { page, perPage } }),
			)

		/**
		 * Get account info from the GitHub installation
		 */
		const getAccountInfo = (accessToken: string): Effect.Effect<GitHubAccountInfo, GitHubApiError> =>
			Effect.gen(function* () {
				const client = makeAuthenticatedClient(accessToken)

				// First, try to get account info from repositories endpoint
				const reposUrl = `${GITHUB_API_BASE_URL}/installation/repositories`
				const reposResponse = yield* client.get(reposUrl).pipe(Effect.scoped)

				if (reposResponse.status >= 200 && reposResponse.status < 300) {
					const data = yield* reposResponse.json.pipe(
						Effect.flatMap(Schema.decodeUnknown(GitHubRepositoriesApiResponse)),
						Effect.catchAll(() => Effect.succeed({ total_count: 0, repositories: [] })),
					)

					// Get the owner from the first repository
					const firstRepo = data.repositories[0]
					if (firstRepo?.owner) {
						return {
							externalAccountId: String(firstRepo.owner.id),
							externalAccountName: firstRepo.owner.login,
						} satisfies GitHubAccountInfo
					}
				}

				// Fallback: try to get authenticated app info
				const appUrl = `${GITHUB_API_BASE_URL}/app`
				const appResponse = yield* client.get(appUrl).pipe(Effect.scoped)

				if (appResponse.status >= 200 && appResponse.status < 300) {
					const appData = yield* appResponse.json.pipe(
						Effect.flatMap(Schema.decodeUnknown(GitHubAppApiResponse)),
						Effect.catchAll(() => Effect.succeed({ id: 0, name: "GitHub App" })),
					)

					return {
						externalAccountId: String(appData.id),
						externalAccountName: appData.name,
					} satisfies GitHubAccountInfo
				}

				// If we can't get account info, use placeholder
				return {
					externalAccountId: "unknown",
					externalAccountName: "GitHub",
				} satisfies GitHubAccountInfo
			}).pipe(
				Effect.catchTag("RequestError", (error) =>
					Effect.fail(
						new GitHubApiError({
							message: `Network error: ${String(error)}`,
							cause: error,
						}),
					),
				),
				Effect.catchTag("ResponseError", (error) =>
					Effect.fail(
						new GitHubApiError({
							message: `Response error: ${String(error)}`,
							status: error.response.status,
							cause: error,
						}),
					),
				),
				Effect.withSpan("GitHubApiClient.getAccountInfo"),
			)

		return {
			fetchPR,
			fetchRepositories,
			getAccountInfo,
		}
	}),
	dependencies: [FetchHttpClient.layer],
}) {}

// ============================================================================
// Legacy exports for backwards compatibility
// ============================================================================

/**
 * @deprecated Use GitHubApiClient.fetchPR instead
 *
 * Fetch a GitHub PR by owner, repo, and number using the provided access token.
 * This is a legacy function that creates a temporary GitHubApiClient.
 */
export const fetchGitHubPR = (
	owner: string,
	repo: string,
	prNumber: number,
	accessToken: string,
): Effect.Effect<GitHubPR, GitHubApiError | GitHubPRNotFoundError> =>
	Effect.gen(function* () {
		const client = yield* GitHubApiClient
		return yield* client.fetchPR(owner, repo, prNumber, accessToken)
	}).pipe(Effect.provide(GitHubApiClient.Default))
