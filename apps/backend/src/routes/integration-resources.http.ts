import { HttpApiBuilder } from "@effect/platform"
import { InternalServerError, type OrganizationId, withSystemActor } from "@hazel/domain"
import {
	GitHubPRResourceResponse,
	GitHubRepositoriesResponse,
	IntegrationNotConnectedForPreviewError,
	IntegrationResourceError,
	LinearIssueResourceResponse,
	ResourceNotFoundError,
} from "@hazel/domain/http"
import { Effect, Option } from "effect"
import { HazelApi } from "../api"
import { IntegrationConnectionRepo } from "../repositories/integration-connection-repo"
import { IntegrationTokenService, TokenNotFoundError } from "../services/integration-token-service"
import {
	fetchGitHubPR,
	type GitHubApiError,
	type GitHubPRNotFoundError,
	parseGitHubPRUrl,
} from "../services/integrations/github-resource-provider"
import {
	fetchLinearIssue,
	type LinearApiError,
	type LinearIssueNotFoundError,
	parseLinearIssueUrl,
} from "../services/integrations/linear-resource-provider"

export const HttpIntegrationResourceLive = HttpApiBuilder.group(
	HazelApi,
	"integration-resources",
	(handlers) =>
		handlers
			.handle("fetchLinearIssue", ({ path, urlParams }) =>
				Effect.gen(function* () {
					const { orgId } = path
					const { url } = urlParams

					// Parse the Linear issue URL
					const parsed = parseLinearIssueUrl(url)
					if (!parsed) {
						return yield* Effect.fail(
							new ResourceNotFoundError({
								url,
								message: "Invalid Linear issue URL format",
							}),
						)
					}

					// Check if organization has Linear connected
					const connectionRepo = yield* IntegrationConnectionRepo
					const connectionOption = yield* connectionRepo
						.findByOrgAndProvider(orgId, "linear")
						.pipe(withSystemActor)

					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(
							new IntegrationNotConnectedForPreviewError({ provider: "linear" }),
						)
					}

					const connection = connectionOption.value

					// Check if connection is active
					if (connection.status !== "active") {
						return yield* Effect.fail(
							new IntegrationNotConnectedForPreviewError({ provider: "linear" }),
						)
					}

					// Get valid access token
					const tokenService = yield* IntegrationTokenService
					const accessToken = yield* tokenService.getValidAccessToken(connection.id)

					// Fetch issue from Linear API
					const issue = yield* fetchLinearIssue(parsed.issueKey, accessToken)

					// Transform to response
					return new LinearIssueResourceResponse({
						id: issue.id,
						identifier: issue.identifier,
						title: issue.title,
						description: issue.description,
						url: issue.url,
						teamName: issue.teamName,
						state: issue.state,
						assignee: issue.assignee,
						priority: issue.priority,
						priorityLabel: issue.priorityLabel,
						labels: issue.labels,
					})
				}).pipe(
					Effect.tapError((error) =>
						Effect.logError("Linear issue fetch failed").pipe(
							Effect.annotateLogs({ error: String(error), errorType: error._tag }),
						),
					),
					Effect.catchTags({
						TokenNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "linear" })),
						LinearApiError: (error: LinearApiError) =>
							Effect.fail(
								new IntegrationResourceError({
									url: urlParams.url,
									message: error.message,
									provider: "linear",
								}),
							),
						LinearIssueNotFoundError: (error: LinearIssueNotFoundError) =>
							Effect.fail(
								new ResourceNotFoundError({
									url: urlParams.url,
									message: `Issue not found: ${error.issueId}`,
								}),
							),
						DatabaseError: (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while fetching integration",
									detail: String(error),
								}),
							),
						// When token decryption fails, prompt user to reconnect instead of showing 500 error
						IntegrationEncryptionError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "linear" })),
						KeyVersionNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "linear" })),
						TokenRefreshError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "linear" })),
						ConnectionNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "linear" })),
					}),
				),
			)
			.handle("fetchGitHubPR", ({ path, urlParams }) =>
				Effect.gen(function* () {
					const { orgId } = path
					const { url } = urlParams

					// Parse the GitHub PR URL
					const parsed = parseGitHubPRUrl(url)
					if (!parsed) {
						return yield* Effect.fail(
							new ResourceNotFoundError({
								url,
								message: "Invalid GitHub PR URL format",
							}),
						)
					}

					// Check if organization has GitHub connected
					const connectionRepo = yield* IntegrationConnectionRepo
					const connectionOption = yield* connectionRepo
						.findByOrgAndProvider(orgId, "github")
						.pipe(withSystemActor)

					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(
							new IntegrationNotConnectedForPreviewError({ provider: "github" }),
						)
					}

					const connection = connectionOption.value

					// Check if connection is active
					if (connection.status !== "active") {
						return yield* Effect.fail(
							new IntegrationNotConnectedForPreviewError({ provider: "github" }),
						)
					}

					// Get valid access token
					const tokenService = yield* IntegrationTokenService
					const accessToken = yield* tokenService.getValidAccessToken(connection.id)

					// Fetch PR from GitHub API
					const pr = yield* fetchGitHubPR(parsed.owner, parsed.repo, parsed.number, accessToken)

					// Transform to response
					return new GitHubPRResourceResponse({
						owner: pr.owner,
						repo: pr.repo,
						number: pr.number,
						title: pr.title,
						body: pr.body,
						state: pr.state,
						draft: pr.draft,
						merged: pr.merged,
						author: pr.author,
						additions: pr.additions,
						deletions: pr.deletions,
						headRefName: pr.headRefName,
						updatedAt: pr.updatedAt,
						labels: pr.labels,
					})
				}).pipe(
					Effect.tapError((error) =>
						Effect.logError("GitHub PR fetch failed").pipe(
							Effect.annotateLogs({ error: String(error), errorType: error._tag }),
						),
					),
					Effect.catchTags({
						TokenNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						GitHubApiError: (error: GitHubApiError) =>
							Effect.fail(
								new IntegrationResourceError({
									url: urlParams.url,
									message: error.message,
									provider: "github",
								}),
							),
						GitHubPRNotFoundError: (error: GitHubPRNotFoundError) =>
							Effect.fail(
								new ResourceNotFoundError({
									url: urlParams.url,
									message: `PR not found: ${error.owner}/${error.repo}#${error.number}`,
								}),
							),
						DatabaseError: (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while fetching integration",
									detail: String(error),
								}),
							),
						// When token decryption fails, prompt user to reconnect instead of showing 500 error
						IntegrationEncryptionError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						KeyVersionNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						TokenRefreshError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						ConnectionNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
					}),
				),
			)
			.handle("getGitHubRepositories", ({ path, urlParams }) =>
				handleGetGitHubRepositories(path, urlParams).pipe(
					Effect.catchTags({
						DatabaseError: (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Failed to fetch GitHub repositories",
									detail: String(error),
								}),
							),
						TokenNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						IntegrationEncryptionError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						KeyVersionNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						TokenRefreshError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
						ConnectionNotFoundError: () =>
							Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" })),
					}),
				),
			),
)

/**
 * Get GitHub repositories accessible to the GitHub App installation.
 */
const handleGetGitHubRepositories = Effect.fn("integration-resources.getGitHubRepositories")(function* (
	path: { orgId: OrganizationId },
	urlParams: { page: number; perPage: number },
) {
	const { orgId } = path
	const { page, perPage } = urlParams

	const connectionRepo = yield* IntegrationConnectionRepo
	const tokenService = yield* IntegrationTokenService

	// Check if organization has GitHub connected
	const connectionOption = yield* connectionRepo.findByOrgAndProvider(orgId, "github").pipe(withSystemActor)

	if (Option.isNone(connectionOption)) {
		return yield* Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" }))
	}

	const connection = connectionOption.value

	// Check if connection is active
	if (connection.status !== "active") {
		return yield* Effect.fail(new IntegrationNotConnectedForPreviewError({ provider: "github" }))
	}

	// Get valid access token
	const accessToken = yield* tokenService.getValidAccessToken(connection.id)

	// Fetch repositories from GitHub API
	const response = yield* Effect.tryPromise({
		try: async () => {
			const res = await fetch(
				`https://api.github.com/installation/repositories?per_page=${perPage}&page=${page}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					},
				},
			)

			if (!res.ok) {
				const errorText = await res.text()
				throw new Error(`GitHub API error: ${res.status} ${errorText}`)
			}

			return res.json()
		},
		catch: (error) =>
			new InternalServerError({
				message: "Failed to fetch GitHub repositories",
				detail: String(error),
			}),
	})

	// Transform to response format
	const repositories = (response.repositories ?? []).map((repo: any) => ({
		id: repo.id,
		name: repo.name,
		fullName: repo.full_name,
		private: repo.private,
		htmlUrl: repo.html_url,
		description: repo.description ?? null,
		owner: {
			login: repo.owner.login,
			avatarUrl: repo.owner.avatar_url ?? null,
		},
	}))

	const totalCount = response.total_count ?? 0
	const hasNextPage = page * perPage < totalCount

	return new GitHubRepositoriesResponse({
		totalCount,
		repositories,
		hasNextPage,
		page,
		perPage,
	})
})
