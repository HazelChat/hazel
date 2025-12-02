import { Data, Effect } from "effect"

/**
 * Error for when Linear command execution fails
 */
export class LinearCommandError extends Data.TaggedError("LinearCommandError")<{
	readonly message: string
	readonly cause?: unknown
}> {}

/**
 * Result of creating a Linear issue
 */
export interface LinearIssueCreatedResult {
	id: string
	identifier: string
	title: string
	url: string
	teamName: string
}

/**
 * GraphQL mutation to create a Linear issue
 */
const CREATE_ISSUE_MUTATION = `
mutation CreateIssue($teamId: String!, $title: String!, $description: String) {
  issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
    success
    issue {
      id
      identifier
      title
      url
      team {
        name
      }
    }
  }
}
`

/**
 * GraphQL query to get the user's default (first) team
 */
const GET_DEFAULT_TEAM_QUERY = `
query GetDefaultTeam {
  teams(first: 1) {
    nodes {
      id
      name
    }
  }
}
`

/**
 * Get the default team ID for the authenticated user
 */
export const getDefaultTeamId = (
	accessToken: string,
): Effect.Effect<{ id: string; name: string }, LinearCommandError> =>
	Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: async () => {
				const res = await fetch("https://api.linear.app/graphql", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: GET_DEFAULT_TEAM_QUERY,
					}),
				})

				if (!res.ok) {
					if (res.status === 401 || res.status === 403) {
						throw new Error("Linear authentication failed - please reconnect")
					}
					if (res.status === 429) {
						throw new Error("Rate limit exceeded, try again later")
					}
					throw new Error(`Could not connect to Linear (${res.status})`)
				}

				return res.json()
			},
			catch: (error) =>
				new LinearCommandError({
					message: error instanceof Error ? error.message : "Could not connect to Linear",
					cause: error,
				}),
		})

		// Check for GraphQL errors
		if (response.errors && response.errors.length > 0) {
			const firstError = response.errors[0]?.message || "Unknown error"
			return yield* Effect.fail(
				new LinearCommandError({
					message: firstError,
				}),
			)
		}

		const team = response.data?.teams?.nodes?.[0]
		if (!team) {
			return yield* Effect.fail(
				new LinearCommandError({
					message: "No teams found in your Linear workspace",
				}),
			)
		}

		return { id: team.id, name: team.name }
	})

/**
 * Create a new Linear issue
 *
 * @param accessToken - The Linear API access token
 * @param params.title - Issue title (required)
 * @param params.description - Issue description (optional)
 * @param params.teamId - Team ID to create the issue in (optional, defaults to first team)
 */
export const createIssue = (
	accessToken: string,
	params: {
		title: string
		description?: string
		teamId?: string
	},
): Effect.Effect<LinearIssueCreatedResult, LinearCommandError> =>
	Effect.gen(function* () {
		// Get team ID - use provided or fetch default
		const team = params.teamId ? { id: params.teamId, name: "" } : yield* getDefaultTeamId(accessToken)

		const response = yield* Effect.tryPromise({
			try: async () => {
				const res = await fetch("https://api.linear.app/graphql", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: CREATE_ISSUE_MUTATION,
						variables: {
							teamId: team.id,
							title: params.title,
							description: params.description || null,
						},
					}),
				})

				if (!res.ok) {
					if (res.status === 401 || res.status === 403) {
						throw new Error("Linear authentication failed - please reconnect")
					}
					if (res.status === 429) {
						throw new Error("Rate limit exceeded, try again later")
					}
					throw new Error(`Could not connect to Linear (${res.status})`)
				}

				return res.json()
			},
			catch: (error) =>
				new LinearCommandError({
					message: error instanceof Error ? error.message : "Could not connect to Linear",
					cause: error,
				}),
		})

		// Check for GraphQL errors
		if (response.errors && response.errors.length > 0) {
			const firstError = response.errors[0]?.message || "Unknown error"
			return yield* Effect.fail(
				new LinearCommandError({
					message: firstError,
				}),
			)
		}

		const result = response.data?.issueCreate
		if (!result?.success || !result?.issue) {
			return yield* Effect.fail(
				new LinearCommandError({
					message: "Failed to create issue",
				}),
			)
		}

		return {
			id: result.issue.id,
			identifier: result.issue.identifier,
			title: result.issue.title,
			url: result.issue.url,
			teamName: result.issue.team?.name ?? team.name ?? "Linear",
		}
	})
