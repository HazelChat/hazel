import { Toolkit } from "effect/unstable/ai"
import { LinearApiClient, makeLinearSdkClient } from "@hazel/integrations/linear"
import { CraftApiClient } from "@hazel/integrations/craft"
import type { IntegrationConnection } from "@hazel/domain/models"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"

import type { HazelBotClient } from "@hazel-chat/bot-sdk"
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
import {
	CraftSearchDocuments,
	CraftGetDocument,
	CraftCreateDocument,
	CraftInsertBlocks,
	CraftGetTasks,
	CraftCreateTask,
	CraftGetFolders,
	CraftSearchBlocks,
} from "./craft.ts"

const BaseToolkit = Toolkit.make(GetCurrentTime, Calculate)

const LinearToolkit = Toolkit.make(
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

const CraftToolkit = Toolkit.make(
	GetCurrentTime,
	Calculate,
	CraftSearchDocuments,
	CraftGetDocument,
	CraftCreateDocument,
	CraftInsertBlocks,
	CraftGetTasks,
	CraftCreateTask,
	CraftGetFolders,
	CraftSearchBlocks,
)

const LinearAndCraftToolkit = Toolkit.make(
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
	CraftSearchDocuments,
	CraftGetDocument,
	CraftCreateDocument,
	CraftInsertBlocks,
	CraftGetTasks,
	CraftCreateTask,
	CraftGetFolders,
	CraftSearchBlocks,
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

const buildLinearHandlers = (options: { bot: HazelBotClient; orgId: OrganizationId }) => {
	const getLinearToken = () =>
		options.bot.integration.getToken(options.orgId, "linear").pipe(Effect.map((r) => r.accessToken))

	return {
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
	} as const
}

const buildCraftHandlers = (options: { bot: HazelBotClient; orgId: OrganizationId }) => {
	const getCraftCredentials = () =>
		options.bot.integration.getToken(options.orgId, "craft").pipe(
			Effect.map((r) => ({
				accessToken: r.accessToken,
				baseUrl: (r.settings as Record<string, unknown> | null)?.baseUrl as string,
			})),
		)

	return {
		craft_search_documents: (args: { query: string }) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.searchDocuments(baseUrl, accessToken, args.query)
			}),

		craft_get_document: (args: { documentId: string }) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.getBlocks(baseUrl, accessToken, args.documentId)
			}),

		craft_create_document: (args: { title: string; content?: string; folderId?: string }) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.createDocuments(baseUrl, accessToken, [
					{ title: args.title, content: args.content, folderId: args.folderId },
				])
			}),

		craft_insert_blocks: (args: {
			documentId: string
			blocks: ReadonlyArray<{ type: string; content?: string }>
			parentBlockId?: string
		}) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.insertBlocks(
					baseUrl,
					accessToken,
					args.documentId,
					args.blocks,
					args.parentBlockId,
				)
			}),

		craft_get_tasks: (args: { scope?: "inbox" | "active" | "upcoming" | "logbook" }) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.getTasks(baseUrl, accessToken, args.scope)
			}),

		craft_create_task: (args: { content: string; documentId?: string }) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.createTasks(baseUrl, accessToken, [
					{ content: args.content, documentId: args.documentId },
				])
			}),

		craft_get_folders: () =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.listFolders(baseUrl, accessToken)
			}),

		craft_search_blocks: (args: { documentId: string; query: string }) =>
			Effect.gen(function* () {
				const { baseUrl, accessToken } = yield* getCraftCredentials()
				return yield* CraftApiClient.searchBlocks(baseUrl, accessToken, args.documentId, args.query)
			}),
	} as const
}

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
	const hasCraft = options.enabledIntegrations.has("craft")

	if (hasLinear && hasCraft) {
		return Effect.gen(function* () {
			const handlers = {
				...baseHandlers,
				...buildLinearHandlers(options),
				...buildCraftHandlers(options),
			}
			const ctx = yield* LinearAndCraftToolkit.toContext(handlers as any)
			return yield* Effect.provide(LinearAndCraftToolkit, ctx)
		})
	}

	if (hasLinear) {
		return Effect.gen(function* () {
			const handlers = {
				...baseHandlers,
				...buildLinearHandlers(options),
			}
			const ctx = yield* LinearToolkit.toContext(handlers as any)
			return yield* Effect.provide(LinearToolkit, ctx)
		})
	}

	if (hasCraft) {
		return Effect.gen(function* () {
			const handlers = {
				...baseHandlers,
				...buildCraftHandlers(options),
			}
			const ctx = yield* CraftToolkit.toContext(handlers as any)
			return yield* Effect.provide(CraftToolkit, ctx)
		})
	}

	return Effect.gen(function* () {
		const ctx = yield* BaseToolkit.toContext(baseHandlers)
		return yield* Effect.provide(BaseToolkit, ctx)
	})
}
