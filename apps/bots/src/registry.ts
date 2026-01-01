/**
 * Bot Actor Registry
 *
 * Registers all bot actors with Rivet.
 * Each bot actor handles commands for all organizations.
 */

import { setup } from "rivetkit"
import { reminderBot } from "@hazel/bots/actors"

export const registry = setup({
	use: {
		"reminder-bot": reminderBot,
	},
})

export type Registry = typeof registry
