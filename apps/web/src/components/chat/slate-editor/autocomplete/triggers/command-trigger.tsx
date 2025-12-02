"use client"

import { useMemo } from "react"
import { AutocompleteListBox } from "../autocomplete-listbox"
import type { AutocompleteOption, AutocompleteState, BotCommandData } from "../types"
import { BotCommandItem } from "./bot-command-item"

interface CommandTriggerProps {
	/** Bot command items to display */
	items: AutocompleteOption<BotCommandData>[]
	/** Currently active index */
	activeIndex: number
	/** Callback when an item is selected */
	onSelect: (index: number) => void
	/** Callback when mouse hovers over an item */
	onHover: (index: number) => void
}

/**
 * Command trigger component
 * Renders bot command suggestions with avatars and argument hints
 */
export function CommandTrigger({ items, activeIndex, onSelect, onHover }: CommandTriggerProps) {
	return (
		<AutocompleteListBox
			items={items}
			activeIndex={activeIndex}
			onSelect={onSelect}
			onHover={onHover}
			renderItem={BotCommandItem}
			emptyMessage="No bot commands available"
		/>
	)
}

/**
 * Filter and map bot commands to autocomplete options
 */
export function useBotCommandOptions(
	state: AutocompleteState,
	botCommands: BotCommandData[],
): AutocompleteOption<BotCommandData>[] {
	return useMemo(() => {
		const search = state.search.toLowerCase()

		return botCommands
			.filter(
				(cmd) =>
					cmd.name.toLowerCase().includes(search) ||
					cmd.bot.name.toLowerCase().includes(search) ||
					cmd.description.toLowerCase().includes(search),
			)
			.map((cmd) => ({
				id: `${cmd.bot.id}-${cmd.id}`,
				label: `/${cmd.name}`,
				description: cmd.description,
				data: cmd,
			}))
	}, [state.search, botCommands])
}
