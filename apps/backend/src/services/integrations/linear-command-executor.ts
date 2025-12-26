import { Effect, Option, Schema } from "effect"

/**
 * Error for when Linear command execution fails
 */
export class LinearCommandError extends Schema.TaggedError<LinearCommandError>()("LinearCommandError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

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

// ============ Response Schemas ============

/** Schema for GraphQL errors */
const GraphQLError = Schema.Struct({
	message: Schema.String,
})

/** Schema for getDefaultTeam response */
const GetDefaultTeamResponse = Schema.Struct({
	data: Schema.optionalWith(
		Schema.Struct({
			teams: Schema.Struct({
				nodes: Schema.Array(
					Schema.Struct({
						id: Schema.String,
						name: Schema.String,
					}),
				),
			}),
		}),
		{ as: "Option" },
	),
	errors: Schema.optionalWith(Schema.Array(GraphQLError), { as: "Option" }),
})

/** Schema for createIssue response */
const CreateIssueResponse = Schema.Struct({
	data: Schema.optionalWith(
		Schema.Struct({
			issueCreate: Schema.Struct({
				success: Schema.Boolean,
				issue: Schema.optionalWith(
					Schema.Struct({
						id: Schema.String,
						identifier: Schema.String,
						title: Schema.String,
						url: Schema.String,
						team: Schema.optionalWith(
							Schema.Struct({
								name: Schema.String,
							}),
							{ as: "Option" },
						),
					}),
					{ as: "Option" },
				),
			}),
		}),
		{ as: "Option" },
	),
	errors: Schema.optionalWith(Schema.Array(GraphQLError), { as: "Option" }),
})

/**
 * Get the default team ID for the authenticated user
 */
export const getDefaultTeamId = Effect.fn("Linear.getDefaultTeamId")(function* (accessToken: string) {
	const rawResponse = yield* Effect.tryPromise({
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

	// Validate response structure
	const response = yield* Schema.decodeUnknown(GetDefaultTeamResponse)(rawResponse).pipe(
		Effect.mapError(
			(parseError) =>
				new LinearCommandError({
					message: "Unexpected response format from Linear",
					cause: parseError,
				}),
		),
	)

	// Check for GraphQL errors
	if (Option.isSome(response.errors) && response.errors.value.length > 0) {
		const firstError = response.errors.value[0]?.message ?? "Unknown error"
		return yield* Effect.fail(
			new LinearCommandError({
				message: firstError,
			}),
		)
	}

	// Extract team from validated data
	const teams = Option.isSome(response.data) ? response.data.value.teams.nodes : []
	const team = teams[0]
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
export const createIssue = Effect.fn("Linear.createIssue")(function* (
	accessToken: string,
	params: {
		title: string
		description?: string
		teamId?: string
	},
) {
	// Get team ID - use provided or fetch default
	const team = params.teamId ? { id: params.teamId, name: "" } : yield* getDefaultTeamId(accessToken)

	const rawResponse = yield* Effect.tryPromise({
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

	// Validate response structure
	const response = yield* Schema.decodeUnknown(CreateIssueResponse)(rawResponse).pipe(
		Effect.mapError(
			(parseError) =>
				new LinearCommandError({
					message: "Unexpected response format from Linear",
					cause: parseError,
				}),
		),
	)

	// Check for GraphQL errors
	if (Option.isSome(response.errors) && response.errors.value.length > 0) {
		const firstError = response.errors.value[0]?.message ?? "Unknown error"
		return yield* Effect.fail(
			new LinearCommandError({
				message: firstError,
			}),
		)
	}

	// Extract issue data from validated response
	const issueCreate = Option.isSome(response.data) ? response.data.value.issueCreate : null
	const issue = issueCreate && Option.isSome(issueCreate.issue) ? issueCreate.issue.value : null

	if (!issueCreate?.success || !issue) {
		return yield* Effect.fail(
			new LinearCommandError({
				message: "Failed to create issue",
			}),
		)
	}

	return {
		id: issue.id,
		identifier: issue.identifier,
		title: issue.title,
		url: issue.url,
		teamName: Option.isSome(issue.team) ? issue.team.value.name : team.name || "Linear",
	} satisfies LinearIssueCreatedResult
})
