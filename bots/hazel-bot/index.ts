import {
	Command,
	CommandGroup,
	runHazelBot,
	buildIntegrationTools,
	generateIntegrationInstructions,
	type AIContentChunk,
	type HazelBotClient,
	type TokenResult,
	type IntegrationToolFactory,
	type ToolFactoryOptions,
} from "@hazel/bot-sdk"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { Cause, Config, Effect, JSONSchema, Redacted, Runtime, Schema, Stream } from "effect"
import { LinearApiClient, makeLinearSdkClient } from "@hazel/integrations/linear"

// Vercel AI SDK imports
import { ToolLoopAgent, tool, jsonSchema } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { TextStreamPart, Tool } from "ai"

// ============================================================================
// Effect Schema to Vercel AI SDK Helper
// ============================================================================

function effectSchemaToJsonSchema<A, I>(schema: Schema.Schema<A, I, never>) {
	const jsonSchema7 = JSONSchema.make(schema)

	return jsonSchema<A>(jsonSchema7, {
		validate: (value: unknown) => {
			const result = Schema.decodeUnknownEither(schema)(value)
			if (result._tag === "Right") {
				return { success: true, value: result.right } as const
			}
			return { success: false, error: new Error(String(result.left)) } as const
		},
	})
}

// ============================================================================
// Base Tools (always available)
// ============================================================================

const baseTools = {
	get_current_time: tool({
		description: "Get the current date and time in ISO format",
		inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
		execute: async () => new Date().toISOString(),
	}),

	calculate: tool({
		description: "Perform basic arithmetic calculations",
		inputSchema: effectSchemaToJsonSchema(
			Schema.Struct({
				operation: Schema.Literal("add", "subtract", "multiply", "divide").annotations({
					description: "The arithmetic operation to perform",
				}),
				a: Schema.Number.annotations({ description: "First operand" }),
				b: Schema.Number.annotations({ description: "Second operand" }),
			}),
		),
		execute: async ({ operation, a, b }) => {
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
		},
	}),
}

// ============================================================================
// Linear Tool Factory
// ============================================================================

const makeLinearTools = (options: ToolFactoryOptions) => {
	const getLinearAccessToken = () => options.getAccessToken("linear")
	const { runPromise } = options

	return {
		linear_get_account_info: tool({
			description: "Get the connected Linear account info for the current organization",
			inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
			execute: async () => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const info = await runPromise(LinearApiClient.getAccountInfo(token.accessToken))
					return {
						ok: true,
						externalAccountId: info.externalAccountId,
						externalAccountName: info.externalAccountName,
					} as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_get_default_team: tool({
			description: "Get the default Linear team for the connected Linear account",
			inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
			execute: async () => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const team = await runPromise(LinearApiClient.getDefaultTeam(token.accessToken))
					return { ok: true, team } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_create_issue: tool({
			description:
				"Create a Linear issue. Use this after confirming with the user what you will create.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					title: Schema.String.annotations({
						description: "Issue title (max ~80 chars recommended)",
					}),
					description: Schema.optional(
						Schema.String.annotations({ description: "Markdown description for the issue" }),
					),
					teamId: Schema.optional(
						Schema.String.annotations({
							description: "Optional team ID; if omitted, uses the user's default team",
						}),
					),
				}),
			),
			execute: async ({
				title,
				description,
				teamId,
			}: {
				title: string
				description?: string
				teamId?: string
			}) => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const issue = await runPromise(
						LinearApiClient.createIssue(token.accessToken, { title, description, teamId }),
					)
					return { ok: true, issue } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_fetch_issue: tool({
			description: 'Fetch a Linear issue by key (e.g. "ENG-123")',
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					issueKey: Schema.String.annotations({ description: 'Issue key like "ENG-123"' }),
				}),
			),
			execute: async ({ issueKey }: { issueKey: string }) => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const issue = await runPromise(LinearApiClient.fetchIssue(issueKey, token.accessToken))
					return { ok: true, issue } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_list_issues: tool({
			description:
				"List Linear issues with optional filters (team, state, assignee, priority). Returns paginated results.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					teamId: Schema.optional(Schema.String.annotations({ description: "Filter by team ID" })),
					stateType: Schema.optional(
						Schema.Literal(
							"triage",
							"backlog",
							"unstarted",
							"started",
							"completed",
							"canceled",
						).annotations({
							description: "Filter by state type",
						}),
					),
					assigneeId: Schema.optional(
						Schema.String.annotations({ description: "Filter by assignee ID" }),
					),
					priority: Schema.optional(
						Schema.Number.annotations({
							description: "Filter by priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)",
						}),
					),
					first: Schema.optional(
						Schema.Number.annotations({
							description: "Number of issues to return (default 25, max 50)",
						}),
					),
					after: Schema.optional(
						Schema.String.annotations({ description: "Pagination cursor for next page" }),
					),
				}),
			),
			execute: async ({
				teamId,
				stateType,
				assigneeId,
				priority,
				first,
				after,
			}: {
				teamId?: string
				stateType?: "triage" | "backlog" | "unstarted" | "started" | "completed" | "canceled"
				assigneeId?: string
				priority?: number
				first?: number
				after?: string
			}) => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const sdkClient = makeLinearSdkClient(token.accessToken)
					const result = await runPromise(
						sdkClient.listIssues({ teamId, stateType, assigneeId, priority, first, after }),
					)
					return { ok: true, ...result } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_search_issues: tool({
			description:
				"Search Linear issues by text query. Searches across title, description, and comments.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					query: Schema.String.annotations({ description: "Search text to find issues" }),
					first: Schema.optional(
						Schema.Number.annotations({
							description: "Number of issues to return (default 25, max 50)",
						}),
					),
					after: Schema.optional(
						Schema.String.annotations({ description: "Pagination cursor for next page" }),
					),
					includeArchived: Schema.optional(
						Schema.Boolean.annotations({
							description: "Include archived issues in search (default false)",
						}),
					),
				}),
			),
			execute: async ({
				query,
				first,
				after,
				includeArchived,
			}: {
				query: string
				first?: number
				after?: string
				includeArchived?: boolean
			}) => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const sdkClient = makeLinearSdkClient(token.accessToken)
					const result = await runPromise(
						sdkClient.searchIssues(query, { first, after, includeArchived }),
					)
					return { ok: true, ...result } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_list_teams: tool({
			description: "List all teams in the connected Linear workspace",
			inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
			execute: async () => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const sdkClient = makeLinearSdkClient(token.accessToken)
					const result = await runPromise(sdkClient.listTeams())
					return { ok: true, ...result } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_get_workflow_states: tool({
			description:
				"Get available workflow states (statuses) from Linear. Optionally filter by team. Use this to find valid state IDs before updating issues.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					teamId: Schema.optional(
						Schema.String.annotations({ description: "Filter states by team ID" }),
					),
				}),
			),
			execute: async ({ teamId }: { teamId?: string }) => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const sdkClient = makeLinearSdkClient(token.accessToken)
					const result = await runPromise(sdkClient.getWorkflowStates(teamId))
					return { ok: true, ...result } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),

		linear_update_issue: tool({
			description:
				"Update an existing Linear issue. Use this after confirming with the user what changes to make. First use linear_get_workflow_states to get valid state IDs if changing status.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					issueId: Schema.String.annotations({
						description: 'Issue identifier (e.g., "ENG-123" or UUID)',
					}),
					title: Schema.optional(
						Schema.String.annotations({ description: "New title for the issue" }),
					),
					description: Schema.optional(
						Schema.String.annotations({ description: "New markdown description" }),
					),
					stateId: Schema.optional(
						Schema.String.annotations({
							description:
								"New state/status ID (get valid IDs from linear_get_workflow_states)",
						}),
					),
					assigneeId: Schema.optional(
						Schema.NullOr(Schema.String).annotations({
							description: "New assignee ID, or null to unassign",
						}),
					),
					priority: Schema.optional(
						Schema.Number.annotations({
							description: "New priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)",
						}),
					),
				}),
			),
			execute: async ({
				issueId,
				title,
				description,
				stateId,
				assigneeId,
				priority,
			}: {
				issueId: string
				title?: string
				description?: string
				stateId?: string
				assigneeId?: string | null
				priority?: number
			}) => {
				const token = await getLinearAccessToken()
				if (!token.ok) return { ok: false, error: token.error }

				try {
					const sdkClient = makeLinearSdkClient(token.accessToken)
					const result = await runPromise(
						sdkClient.updateIssue(issueId, { title, description, stateId, assigneeId, priority }),
					)
					return { ok: true, ...result } as const
				} catch (e) {
					return { ok: false, error: String(e) } as const
				}
			},
		}),
	} as const
}

/**
 * Linear tool factory for use with buildIntegrationTools
 */
const LinearToolFactory: IntegrationToolFactory<Record<string, Tool>> = {
	provider: "linear",
	makeTools: makeLinearTools,
}

// ============================================================================
// Integration Instructions (used for dynamic system prompt)
// ============================================================================

const INTEGRATION_INSTRUCTIONS = {
	linear: `
- Manage Linear issues:
  - Create issues
  - Fetch issue details by key (e.g., "ENG-123")
  - List issues with filters (by team, state, assignee, priority)
  - Search issues by text
  - List teams in the workspace
  - Get workflow states (statuses)
  - Update issues (change status, assignee, priority, title, description)
- Before creating or updating a Linear issue, restate what you plan to do and confirm the user wants you to proceed.
- Prefer fetching context first (e.g., fetch an issue before summarizing or making suggestions).
- When filtering issues, first get available teams and states if you need their IDs.
- Use issue identifiers like "ENG-123" when referring to specific issues.`,
	github: `
- Manage GitHub repositories, issues, and pull requests
- Search code and repositories
- View and create issues
- Review and comment on pull requests`,
	figma: `
- Access Figma files and components
- Extract design information and assets`,
	notion: `
- Access Notion pages and databases
- Create and update content`,
} as const

// ============================================================================
// Vercel AI SDK Stream Part Mapper
// ============================================================================

interface VercelStreamState {
	hasActiveReasoning: boolean
}

const mapVercelPartToChunk = (part: TextStreamPart<any>, state: VercelStreamState): AIContentChunk | null => {
	switch (part.type) {
		case "text-delta":
			return { type: "text", text: part.text }

		case "reasoning-delta":
			state.hasActiveReasoning = true
			return { type: "thinking", text: part.text, isComplete: false }

		case "reasoning-end":
			state.hasActiveReasoning = false
			return { type: "thinking", text: "", isComplete: true }

		case "tool-call":
			return {
				type: "tool_call",
				id: part.toolCallId,
				name: part.toolName,
				input: part.input as Record<string, unknown>,
			}

		case "tool-result":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: part.output,
			}

		case "tool-error":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: null,
				error: String(part.error),
			}

		case "tool-output-denied":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: null,
				error: "Tool execution denied",
			}

		// Skip non-content stream parts
		case "start":
		case "start-step":
		case "text-start":
		case "text-end":
		case "reasoning-start":
		case "tool-input-start":
		case "tool-input-delta":
		case "tool-input-end":
		case "finish-step":
		case "finish":
		case "abort":
		case "source":
		case "file":
		case "error":
		case "raw":
			return null

		default:
			return null
	}
}

// ============================================================================
// Commands
// ============================================================================

const AskCommand = Command.make("ask", {
	description: "Ask the AI agent using ToolLoopAgent pattern (supports tool use and reasoning)",
	args: {
		message: Schema.String,
	},
	usageExample: '/ask message="Search for patterns in the codebase"',
})

const commands = CommandGroup.make(AskCommand)

// ============================================================================
// Shared AI Request Handler
// ============================================================================

/**
 * Shared AI pipeline used by both /ask command and @mention handler.
 * Creates a streaming AI session in the given channel and runs the ToolLoopAgent.
 */
const handleAIRequest = (params: {
	bot: HazelBotClient
	message: string
	channelId: ChannelId
	orgId: OrganizationId
}) =>
	Effect.gen(function* () {
		const { bot, message, channelId, orgId } = params

		const runtime = yield* Effect.runtime<any>()
		const runPromise = Runtime.runPromise(runtime as any) as <A>(
			effect: Effect.Effect<A, any, any>,
		) => Promise<A>

		// Get enabled integrations for this org (cached)
		const enabledIntegrations = yield* bot.integration.getEnabled(orgId)

		yield* Effect.log(`Enabled integrations for org ${orgId}:`, {
			integrations: Array.from(enabledIntegrations),
		})

		// Token cache per provider
		const tokenCache = new Map<string, Promise<TokenResult>>()

		// Create a cached token getter
		const getAccessToken = (
			provider: "linear" | "github" | "figma" | "notion" | "discord",
		): Promise<TokenResult> => {
			const cached = tokenCache.get(provider)
			if (cached) return cached

			const promise = (async () => {
				try {
					const { accessToken } = await runPromise(bot.integration.getToken(orgId, provider))
					return { ok: true, accessToken } as const
				} catch (e: any) {
					const tag = e && typeof e === "object" && "_tag" in e ? String(e._tag) : null
					if (tag === "IntegrationNotConnectedError") {
						// Invalidate cache since the integration is not connected
						runPromise(bot.integration.invalidateCache(orgId))
						return {
							ok: false,
							error: `${provider} is not connected for this organization. Please connect ${provider} and try again.`,
						} as const
					}
					if (tag === "IntegrationNotAllowedError") {
						return {
							ok: false,
							error: `${provider} access is not allowed for this bot. Please allow the ${provider} integration and try again.`,
						} as const
					}
					return {
						ok: false,
						error: `Failed to get ${provider} token: ${tag ?? String(e)}`,
					} as const
				}
			})()

			tokenCache.set(provider, promise)
			return promise
		}

		// Build integration tools based on enabled integrations
		const integrationTools = buildIntegrationTools(enabledIntegrations, [LinearToolFactory], {
			runPromise,
			getAccessToken,
		})

		// Generate dynamic instructions based on enabled integrations
		const integrationInstructions = generateIntegrationInstructions(
			enabledIntegrations,
			INTEGRATION_INSTRUCTIONS,
		)

		const apiKey = yield* Config.redacted("OPENROUTER_API_KEY")

		const openrouter = createOpenRouter({
			apiKey: Redacted.value(apiKey),
		})

		// Create AI streaming session
		const session = yield* bot.ai.stream(channelId, {
			model: "moonshotai/kimi-k2.5",
			showThinking: true,
			showToolCalls: true,
			loading: {
				text: "Thinking...",
				icon: "sparkle",
				throbbing: true,
			},
		})

		yield* Effect.log(`Created streaming message ${session.messageId}`)

		// Build dynamic system instructions
		const systemInstructions = `You are Hazel, an AI assistant in a team chat app alongside human teammates.

Your capabilities:
- Get current date/time
- Perform arithmetic
${integrationInstructions}

Formatting (GFM markdown supported):
- **bold**, *italic*, \`inline code\`
- Code blocks with \`\`\`language
- Lists (- or 1.), blockquotes (>)
- Tables, headings (#, ##, ###)

Rules:
- Keep responses SHORT and conversational - you're in a chat, not writing documentation
- Answer in 1-3 sentences when possible. Only elaborate if truly necessary
- Never reveal secrets (tokens, API keys, credentials)
- Use formatting sparingly to highlight key info
Remember: This is a team chat with real humans. Be helpful but don't dominate the conversation.`

		// Create the ToolLoopAgent instance with dynamic tools
		const codebaseAgent = new ToolLoopAgent({
			model: openrouter("moonshotai/kimi-k2.5"),
			instructions: systemInstructions,
			tools: { ...baseTools, ...integrationTools },
			toolChoice: "auto",
		})

		// Use the agent's stream() method (returns a Promise)
		const result = yield* Effect.promise(() =>
			codebaseAgent.stream({
				prompt: message,
			}),
		)

		const streamState: VercelStreamState = { hasActiveReasoning: false }

		yield* Stream.fromAsyncIterable(result.fullStream, (e) => new Error(String(e))).pipe(
			Stream.map((part) => mapVercelPartToChunk(part, streamState)),
			Stream.filter((chunk): chunk is AIContentChunk => chunk !== null),
			Stream.runForEach((chunk) => session.processChunk(chunk)),
			Effect.matchCauseEffect({
				onSuccess: () =>
					Effect.gen(function* () {
						yield* session.complete()
						yield* Effect.log(`Agent response complete: ${session.messageId}`)
					}),
				onFailure: (cause) =>
					Effect.gen(function* () {
						yield* Effect.logError("Agent streaming failed", { error: cause })

						const userMessage = Cause.match(cause, {
							onEmpty: "Request was cancelled.",
							onFail: (error) => `An error occurred: ${String(error)}`,
							onDie: () => "An unexpected error occurred.",
							onInterrupt: () => "Request was cancelled.",
							onSequential: (left) => left,
							onParallel: (left) => left,
						})

						yield* session.fail(userMessage).pipe(Effect.ignore)
					}),
			}),
		)
	})

// ============================================================================
// Bot Setup
// ============================================================================

runHazelBot({
	commands,
	mentionable: true,
	layers: [LinearApiClient.Default],
	setup: (bot) =>
		Effect.gen(function* () {
			// /ask command handler
			yield* bot.onCommand(AskCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /ask: ${ctx.args.message}`)
					yield* handleAIRequest({
						bot,
						message: ctx.args.message,
						channelId: ctx.channelId,
						orgId: ctx.orgId,
					})
				}),
			)

			yield* bot.onMessage((message) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received message: ${message.content}`)
				}),
			)

			// @mention handler — reply in a thread
			yield* bot.onMention((message) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received @mention: ${message.content}`)
					const authContext = yield* bot.getAuthContext

					// Strip the bot mention from content to get the question
					const question = message.content
						.replace(new RegExp(`@\\[userId:${authContext.userId}\\]`, "g"), "")
						.trim()

					yield* Effect.log(`Received question: ${question}`)

					if (!question) return

					// Resolve thread + org context from backend-authoritative thread API.
					const thread = yield* bot.channel.createThread(message.id, message.channelId)

					yield* Effect.log(`Created thread: ${thread.id}`)
					const threadChannelId = thread.id as ChannelId
					const orgId = thread.organizationId as OrganizationId

					// Run AI pipeline in the thread
					yield* handleAIRequest({
						bot,
						message: question,
						channelId: threadChannelId,
						orgId,
					})
				}),
			)
		}),
})
