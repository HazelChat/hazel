import type { ReactNode } from "react"
import type { Point, Range } from "slate"

/**
 * Type of autocomplete trigger
 */
export type TriggerType = "mention" | "command" | "emoji"

/**
 * Configuration for an autocomplete trigger
 */
export interface AutocompleteTrigger {
	/** Unique identifier for this trigger */
	id: TriggerType
	/** Character that activates this trigger (e.g., '@', '/', ':') */
	char: string
	/** Whether trigger must be at start of line (e.g., '/' for commands) */
	requireStartOfLine?: boolean
	/** Characters that cancel the autocomplete (default: space, newline) */
	cancelChars?: string[]
	/** Minimum search length before showing options (default: 0) */
	minSearchLength?: number
}

/**
 * Generic autocomplete option
 */
export interface AutocompleteOption<T = unknown> {
	/** Unique identifier for this option */
	id: string
	/** Display label */
	label: string
	/** Optional description shown below label */
	description?: string
	/** Optional icon to show before the label */
	icon?: ReactNode
	/** Type-specific data payload */
	data: T
	/** Whether this option is disabled */
	disabled?: boolean
}

/**
 * State of the autocomplete system
 */
export interface AutocompleteState {
	/** Whether autocomplete is currently open */
	isOpen: boolean
	/** The active trigger configuration, or null if closed */
	trigger: AutocompleteTrigger | null
	/** Current search text (after the trigger character) */
	search: string
	/** Currently highlighted option index */
	activeIndex: number
	/** Slate Point where trigger character was typed */
	startPoint: Point | null
	/** Slate Range covering trigger + search text */
	targetRange: Range | null
}

/**
 * Initial/empty autocomplete state
 */
export const initialAutocompleteState: AutocompleteState = {
	isOpen: false,
	trigger: null,
	search: "",
	activeIndex: 0,
	startPoint: null,
	targetRange: null,
}

/**
 * Props for autocomplete item render function
 */
export interface AutocompleteItemRenderProps<T> {
	option: AutocompleteOption<T>
	isHighlighted: boolean
}

/**
 * Trigger-specific data types
 */

// Mention trigger data
export interface MentionData {
	id: string
	type: "user" | "channel" | "here" | "bot"
	displayName: string
	avatarUrl?: string
	status?: "online" | "offline" | "away" | "busy" | "dnd"
}

// Bot command argument definition
export interface BotCommandArgument {
	/** Argument name for display */
	name: string
	/** Description shown in hint */
	description?: string
	/** Whether this argument is required */
	required: boolean
	/** Placeholder text */
	placeholder?: string
	/** Argument type for validation */
	type: "string" | "number" | "user" | "channel"
}

// Bot command trigger data
export interface BotCommandData {
	/** Command ID (unique per bot) */
	id: string
	/** Command name without leading slash (e.g., "summarize") */
	name: string
	/** Human-readable description */
	description: string
	/** Integration provider that owns this command, or "bot" for SDK bots */
	provider: "linear" | "github" | "figma" | "notion" | "bot"
	/** Bot that owns this command */
	bot: {
		id: string
		name: string
		avatarUrl?: string
	}
	/** Command arguments */
	arguments: BotCommandArgument[]
	/** Usage example shown in dropdown */
	usageExample?: string
}

// Emoji trigger data
export interface EmojiData {
	id: string
	emoji: string
	name: string
	keywords?: string[]
}

// Command input state (Discord-style argument entry)
export interface CommandInputState {
	/** Whether command input mode is active */
	isActive: boolean
	/** The selected command */
	command: BotCommandData | null
	/** Current argument values */
	values: Record<string, string>
	/** Which field is focused (index) */
	focusedFieldIndex: number
}

export const initialCommandInputState: CommandInputState = {
	isActive: false,
	command: null,
	values: {},
	focusedFieldIndex: 0,
}
