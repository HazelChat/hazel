/**
 * Linear API Client
 *
 * Direct GraphQL API calls to Linear for creating and fetching issues.
 */

import { Effect, Option, Schema } from "effect"

// ============ Error Types ============

export class LinearCommandError extends Schema.TaggedError<LinearCommandError>()("LinearCommandError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

export class LinearApiError extends Schema.TaggedError<LinearApiError>()("LinearApiError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

export class LinearIssueNotFoundError extends Schema.TaggedError<LinearIssueNotFoundError>()(
	"LinearIssueNotFoundError",
	{
		issueId: Schema.String,
	},
) {}

// ============ Issue Types ============

export interface LinearIssueCreatedResult {
	id: string
	identifier: string
	title: string
	url: string
	teamName: string
}

export const LinearIssueState = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	color: Schema.String,
})

export const LinearIssueAssignee = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
})

export const LinearIssueLabel = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	color: Schema.String,
})

export const LinearIssue = Schema.Struct({
	id: Schema.String,
	identifier: Schema.String,
	title: Schema.String,
	description: Schema.NullOr(Schema.String),
	url: Schema.String,
	teamName: Schema.String,
	state: Schema.NullOr(LinearIssueState),
	assignee: Schema.NullOr(LinearIssueAssignee),
	priority: Schema.Number,
	priorityLabel: Schema.String,
	labels: Schema.Array(LinearIssueLabel),
})

export type LinearIssue = typeof LinearIssue.Type

// ============ URL Parsing ============

const LINEAR_ISSUE_URL_REGEX = /^https:\/\/linear\.app\/([^/]+)\/issue\/([A-Z]+-\d+)/i

export const parseLinearIssueUrl = (url: string): { workspace: string; issueKey: string } | null => {
	const match = url.match(LINEAR_ISSUE_URL_REGEX)
	if (!match) return null
	return {
		workspace: match[1],
		issueKey: match[2],
	}
}

export const extractLinearUrls = (content: string): string[] => {
	const regex = /https:\/\/linear\.app\/[^/]+\/issue\/[A-Z]+-\d+/gi
	return content.match(regex) ?? []
}

// ============ GraphQL Queries/Mutations ============

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

const ISSUE_QUERY = `
query GetIssue($issueId: String!) {
  issue(id: $issueId) {
    id
    identifier
    title
    description
    url
    team {
      name
      key
    }
    state {
      id
      name
      color
    }
    assignee {
      id
      name
      avatarUrl
    }
    priority
    priorityLabel
    labels {
      nodes {
        id
        name
        color
      }
    }
  }
}
`

// ============ Response Schemas ============

const GraphQLError = Schema.Struct({
	message: Schema.String,
})

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

// ============ API Functions ============

const getDefaultTeamId = Effect.fn("Linear.getDefaultTeamId")(function* (accessToken: string) {
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

	const response = yield* Schema.decodeUnknown(GetDefaultTeamResponse)(rawResponse).pipe(
		Effect.mapError(
			(parseError) =>
				new LinearCommandError({
					message: "Unexpected response format from Linear",
					cause: parseError,
				}),
		),
	)

	if (Option.isSome(response.errors) && response.errors.value.length > 0) {
		const firstError = response.errors.value[0]?.message ?? "Unknown error"
		return yield* Effect.fail(
			new LinearCommandError({
				message: firstError,
			}),
		)
	}

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

export const createIssue = Effect.fn("Linear.createIssue")(function* (
	accessToken: string,
	params: {
		title: string
		description?: string
		teamId?: string
	},
) {
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

	const response = yield* Schema.decodeUnknown(CreateIssueResponse)(rawResponse).pipe(
		Effect.mapError(
			(parseError) =>
				new LinearCommandError({
					message: "Unexpected response format from Linear",
					cause: parseError,
				}),
		),
	)

	if (Option.isSome(response.errors) && response.errors.value.length > 0) {
		const firstError = response.errors.value[0]?.message ?? "Unknown error"
		return yield* Effect.fail(
			new LinearCommandError({
				message: firstError,
			}),
		)
	}

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

const parseLinearErrorMessage = (errorMessage: string): string => {
	const lowerMessage = errorMessage.toLowerCase()

	if (lowerMessage.includes("entity not found") || lowerMessage.includes("not found")) {
		return "Issue not found or you don't have access"
	}

	if (lowerMessage.includes("unauthorized") || lowerMessage.includes("authentication")) {
		return "Linear authentication failed"
	}

	if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many requests")) {
		return "Rate limit exceeded, try again later"
	}

	return errorMessage
}

export const fetchLinearIssue = (
	issueKey: string,
	accessToken: string,
): Effect.Effect<LinearIssue, LinearApiError | LinearIssueNotFoundError> =>
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
						query: ISSUE_QUERY,
						variables: { issueId: issueKey },
					}),
				})

				if (!res.ok) {
					if (res.status === 401 || res.status === 403) {
						throw new Error("Linear authentication failed")
					}
					if (res.status === 429) {
						throw new Error("Rate limit exceeded, try again later")
					}
					throw new Error(`Could not connect to Linear (${res.status})`)
				}

				return res.json()
			},
			catch: (error) =>
				new LinearApiError({
					message: error instanceof Error ? error.message : "Could not connect to Linear",
					cause: error,
				}),
		})

		if (response.errors && response.errors.length > 0) {
			const firstError = response.errors[0]?.message || "Unknown error"
			const userFriendlyMessage = parseLinearErrorMessage(firstError)
			return yield* Effect.fail(new LinearApiError({ message: userFriendlyMessage }))
		}

		const issue = response.data?.issue
		if (!issue) {
			return yield* Effect.fail(new LinearIssueNotFoundError({ issueId: issueKey }))
		}

		return {
			id: issue.id,
			identifier: issue.identifier,
			title: issue.title,
			description: issue.description ?? null,
			url: issue.url,
			teamName: issue.team?.name ?? "Linear",
			state: issue.state
				? {
						id: issue.state.id,
						name: issue.state.name,
						color: issue.state.color,
					}
				: null,
			assignee: issue.assignee
				? {
						id: issue.assignee.id,
						name: issue.assignee.name,
						avatarUrl: issue.assignee.avatarUrl ?? null,
					}
				: null,
			priority: issue.priority ?? 0,
			priorityLabel: issue.priorityLabel ?? "No priority",
			labels: (issue.labels?.nodes ?? []).map((label: { id: string; name: string; color: string }) => ({
				id: label.id,
				name: label.name,
				color: label.color,
			})),
		}
	})
