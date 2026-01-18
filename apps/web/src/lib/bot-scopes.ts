import type { BotScope } from "@hazel/domain/rpc"

/**
 * Scope definitions for bot permissions UI.
 * Shared between create and edit bot modals.
 */
export const BOT_SCOPES: Array<{ id: BotScope; label: string; description: string }> = [
	{ id: "messages:read", label: "Read Messages", description: "Read messages in channels" },
	{ id: "messages:write", label: "Send Messages", description: "Send and edit messages" },
	{ id: "channels:read", label: "Read Channels", description: "View channel information" },
	{ id: "channels:write", label: "Manage Channels", description: "Create and modify channels" },
	{ id: "users:read", label: "Read Users", description: "View user profiles" },
	{ id: "reactions:write", label: "Add Reactions", description: "React to messages" },
	{ id: "commands:register", label: "Register Commands", description: "Create slash commands" },
]
