import type { IntegrationConnection } from "@hazel/domain/models"
import { Effect, Option } from "effect"

/**
 * Command argument definition for code-defined commands
 */
export interface CommandArgument {
	name: string
	description?: string
	required: boolean
	placeholder?: string
	type: "string" | "number" | "user" | "channel"
}

/**
 * Bot info for display in the UI
 */
export interface CommandBot {
	id: string
	name: string
	avatarUrl?: string
}

/**
 * Full command definition
 */
export interface IntegrationCommandDef {
	id: string
	name: string
	description: string
	provider: IntegrationConnection.IntegrationProvider
	arguments: CommandArgument[]
	usageExample?: string
	bot: CommandBot
}

// ============ LINEAR COMMANDS ============

const LINEAR_COMMANDS: IntegrationCommandDef[] = [
	{
		id: "linear-issue",
		name: "issue",
		description: "Create a new Linear issue",
		provider: "linear",
		arguments: [
			{
				name: "title",
				description: "Issue title",
				required: true,
				type: "string",
			},
			{
				name: "description",
				description: "Issue description",
				required: false,
				type: "string",
			},
		],
		usageExample: '/issue "Fix login bug" "Users cannot log in with SSO"',
		bot: {
			id: "bot-linear",
			name: "Linear",
			avatarUrl: "https://cdn.brandfetch.io/linear.app/w/64/h/64/theme/dark/icon",
		},
	},
]

// ============ GITHUB COMMANDS (Future) ============

const GITHUB_COMMANDS: IntegrationCommandDef[] = [
	// Placeholder for GitHub commands
	// {
	//   id: "github-issue",
	//   name: "gh-issue",
	//   description: "Create a GitHub issue",
	//   provider: "github",
	//   ...
	// }
]

// ============ FIGMA COMMANDS (Future) ============

const FIGMA_COMMANDS: IntegrationCommandDef[] = [
	// Placeholder for Figma commands
]

// ============ NOTION COMMANDS (Future) ============

const NOTION_COMMANDS: IntegrationCommandDef[] = [
	// Placeholder for Notion commands
]

// ============ COMMAND REGISTRY ============

const ALL_COMMANDS: Record<IntegrationConnection.IntegrationProvider, IntegrationCommandDef[]> = {
	linear: LINEAR_COMMANDS,
	github: GITHUB_COMMANDS,
	figma: FIGMA_COMMANDS,
	notion: NOTION_COMMANDS,
}

/**
 * Command Registry Service
 *
 * Provides access to code-defined integration commands.
 * Commands are organized by provider and can be filtered by connected providers.
 */
export class CommandRegistry extends Effect.Service<CommandRegistry>()("CommandRegistry", {
	accessors: true,
	succeed: {
		/**
		 * Get all commands for a specific provider
		 */
		getCommandsForProvider: (
			provider: IntegrationConnection.IntegrationProvider,
		): IntegrationCommandDef[] => ALL_COMMANDS[provider] ?? [],

		/**
		 * Get all commands for multiple providers (e.g., all connected providers)
		 */
		getCommandsForProviders: (
			providers: IntegrationConnection.IntegrationProvider[],
		): IntegrationCommandDef[] => providers.flatMap((p) => ALL_COMMANDS[p] ?? []),

		/**
		 * Get a specific command by provider and command ID
		 */
		getCommand: (
			provider: IntegrationConnection.IntegrationProvider,
			commandId: string,
		): Option.Option<IntegrationCommandDef> =>
			Option.fromNullable((ALL_COMMANDS[provider] ?? []).find((c) => c.id === commandId)),

		/**
		 * Get all available commands across all providers
		 */
		getAllCommands: (): IntegrationCommandDef[] => Object.values(ALL_COMMANDS).flat(),

		/**
		 * Get all providers that have commands defined
		 */
		getProvidersWithCommands: (): IntegrationConnection.IntegrationProvider[] =>
			(
				Object.entries(ALL_COMMANDS) as [
					IntegrationConnection.IntegrationProvider,
					IntegrationCommandDef[],
				][]
			)
				.filter(([, commands]) => commands.length > 0)
				.map(([provider]) => provider),
	},
}) {}
