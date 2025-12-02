"use client"

import { cx } from "~/utils/cx"
import type { AutocompleteOption, BotCommandData } from "../types"

interface BotCommandItemProps {
	option: AutocompleteOption<BotCommandData>
	isFocused: boolean
}

/**
 * Renders a bot command in the autocomplete dropdown.
 * Shows bot avatar, command name with argument hints, and description.
 */
export function BotCommandItem({ option, isFocused }: BotCommandItemProps) {
	const { data: command } = option

	return (
		<div className="flex items-start gap-2.5">
			{/* Bot avatar */}
			{command.bot.avatarUrl ? (
				<img
					src={command.bot.avatarUrl}
					alt={command.bot.name}
					className="mt-0.5 size-5 shrink-0 rounded-md"
				/>
			) : (
				<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/20 font-medium text-primary text-xs">
					{command.bot.name[0]?.toUpperCase()}
				</div>
			)}

			<div className="min-w-0 flex-1">
				{/* Command with arguments */}
				<div className="flex flex-wrap items-center gap-1.5">
					<span className={cx("font-medium", isFocused ? "text-primary" : "text-fg")}>
						/{command.name}
					</span>
					{command.arguments.map((arg) => (
						<span
							key={arg.name}
							className={cx(
								"rounded px-1.5 py-0.5 text-xs",
								arg.required ? "bg-warning/20 text-warning" : "bg-muted text-muted-fg",
							)}
						>
							{arg.required ? `<${arg.name}>` : `[${arg.name}]`}
						</span>
					))}
				</div>

				{/* Description */}
				<div className="mt-0.5 truncate text-muted-fg text-xs">{command.description}</div>
			</div>
		</div>
	)
}
