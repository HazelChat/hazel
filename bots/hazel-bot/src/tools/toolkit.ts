import { Toolkit } from "@effect/ai"
import { LinearApiClient, makeLinearSdkClient } from "@hazel/integrations/linear"
import type { IntegrationConnection } from "@hazel/domain/models"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"

import type { HazelBotClient } from "@hazel/bot-sdk"
import { GetCurrentTime, Calculate } from "./base.ts"
import {
	LinearGetAccountInfo,
	LinearGetDefaultTeam,
	LinearCreateIssue,
	LinearFetchIssue,
	LinearListIssues,
	LinearSearchIssues,
	LinearListTeams,
	LinearGetWorkflowStates,
	LinearUpdateIssue,
} from "./linear.ts"

const BaseToolkit = Toolkit.make(GetCurrentTime, Calculate)

const FullToolkit = Toolkit.make(
	GetCurrentTime,
	Calculate,
	LinearGetAccountInfo,
	LinearGetDefaultTeam,
	LinearCreateIssue,
	LinearFetchIssue,
	LinearListIssues,
	LinearSearchIssues,
	LinearListTeams,
	LinearGetWorkflowStates,
	LinearUpdateIssue,
)

const baseHandlers = {
	get_current_time: () => Effect.sync(() => new Date().toISOString()),
	calculate: ({
		operation,
		a,
		b,
	}: {
		operation: "add" | "subtract" | "multiply" | "divide"
		a: number
		b: number
	}) =>
		Effect.sync(() => {
			switch (operation) {
				case "add":
					return a + b
				case "subtract":
					return a - b
				case "multiply":
					return a * b
				case "divide":
					return b === 0 ? Number.NaN : a / b
			}
		}),
} as const

/**
 * Build a resolved toolkit with handlers based on enabled integrations.
 * Returns an Effect that yields a WithHandler ready for use with LanguageModel.
 */
export const buildToolkit = (options: {
	bot: HazelBotClient
	orgId: OrganizationId
	enabledIntegrations: Set<IntegrationConnection.IntegrationProvider>
}) => {
	const hasLinear = options.enabledIntegrations.has("linear")

	if (hasLinear) {
		return Effect.gen(function* () {
			const getLinearToken = () =>
				options.bot.integration
					.getToken(options.orgId, "linear")
					.pipe(Effect.map((r) => r.accessToken))

			const handlers = {
				...baseHandlers,

				linear_get_account_info: () =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						return yield* LinearApiClient.getAccountInfo(accessToken)
					}),

				linear_get_default_team: () =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const team = yield* LinearApiClient.getDefaultTeam(accessToken)
						return { team }
					}),

				linear_create_issue: (args: { title: string; description?: string; teamId?: string }) =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const issue = yield* LinearApiClient.createIssue(accessToken, {
							title: args.title,
							description: args.description,
							teamId: args.teamId,
						})
						return { issue }
					}),

				linear_fetch_issue: (args: { issueKey: string }) =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const issue = yield* LinearApiClient.fetchIssue(args.issueKey, accessToken)
						return { issue }
					}),

				linear_list_issues: (args: {
					teamId?: string
					stateType?: "triage" | "backlog" | "unstarted" | "started" | "completed" | "canceled"
					assigneeId?: string
					priority?: number
					first?: number
					after?: string
				}) =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const sdkClient = makeLinearSdkClient(accessToken)
						return yield* sdkClient.listIssues(args)
					}),

				linear_search_issues: (args: {
					query: string
					first?: number
					after?: string
					includeArchived?: boolean
				}) =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const sdkClient = makeLinearSdkClient(accessToken)
						return yield* sdkClient.searchIssues(args.query, {
							first: args.first,
							after: args.after,
							includeArchived: args.includeArchived,
						})
					}),

				linear_list_teams: () =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const sdkClient = makeLinearSdkClient(accessToken)
						return yield* sdkClient.listTeams()
					}),

				linear_get_workflow_states: (args: { teamId?: string }) =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const sdkClient = makeLinearSdkClient(accessToken)
						return yield* sdkClient.getWorkflowStates(args.teamId)
					}),

				linear_update_issue: (args: {
					issueId: string
					title?: string
					description?: string
					stateId?: string
					assigneeId?: string | null
					priority?: number
				}) =>
					Effect.gen(function* () {
						const accessToken = yield* getLinearToken()
						const sdkClient = makeLinearSdkClient(accessToken)
						const { issueId, ...updates } = args
						return yield* sdkClient.updateIssue(issueId, updates)
					}),
			}

			// Type assertion: handler errors are caught by resolveToolCalls (catchAllCause)
			// and runtime requirements (LinearApiClient) are satisfied via context capture
			const ctx = yield* FullToolkit.toContext(handlers as any)
			return yield* Effect.provide(FullToolkit, ctx)
		})
	}

	return Effect.gen(function* () {
		const ctx = yield* BaseToolkit.toContext(baseHandlers)
		return yield* Effect.provide(BaseToolkit, ctx)
	})
}
