"use client"

import { useEffect, useRef } from "react"
import { cx } from "~/utils/cx"
import type { BotCommandData } from "./types"

interface CommandInputPanelProps {
	command: BotCommandData
	values: Record<string, string>
	focusedFieldIndex: number
	onValueChange: (argName: string, value: string) => void
	onFocusField: (index: number) => void
	onExecute: () => void
	onCancel: () => void
}

/**
 * Discord-style command input panel.
 * Shows argument fields when a slash command is selected.
 */
export function CommandInputPanel({
	command,
	values,
	focusedFieldIndex,
	onValueChange,
	onFocusField,
	onExecute,
	onCancel,
}: CommandInputPanelProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	// Focus field when focusedFieldIndex changes
	useEffect(() => {
		inputRefs.current[focusedFieldIndex]?.focus()
	}, [focusedFieldIndex])

	const handleKeyDown = (e: React.KeyboardEvent, argIndex: number) => {
		if (e.key === "Tab") {
			e.preventDefault()
			const nextIndex = e.shiftKey
				? Math.max(0, argIndex - 1)
				: Math.min(command.arguments.length - 1, argIndex + 1)
			onFocusField(nextIndex)
		} else if (e.key === "Enter") {
			e.preventDefault()
			onExecute()
		} else if (e.key === "Escape") {
			e.preventDefault()
			onCancel()
		}
	}

	return (
		<div className="mb-2 rounded-lg border border-border bg-surface-2 p-4">
			{/* Header: Bot avatar + command name */}
			<div className="mb-3 flex items-center gap-2">
				{command.bot.avatarUrl ? (
					<img src={command.bot.avatarUrl} alt={command.bot.name} className="size-5 rounded-md" />
				) : (
					<div className="flex size-5 items-center justify-center rounded-md bg-primary/20 font-medium text-primary text-xs">
						{command.bot.name[0]?.toUpperCase()}
					</div>
				)}
				<span className="font-medium text-fg">/{command.name}</span>
				<span className="text-muted-fg text-sm">{command.description}</span>
			</div>

			{/* Argument fields */}
			{command.arguments.length > 0 && (
				<div className="flex flex-wrap gap-4">
					{command.arguments.map((arg, index) => (
						<label key={arg.name} className="min-w-48 flex-1">
							<span className="mb-1 block text-fg text-sm">
								{arg.name}
								{arg.required && <span className="ml-1 text-warning">*</span>}
							</span>
							<input
								ref={(el) => {
									inputRefs.current[index] = el
								}}
								type={arg.type === "number" ? "number" : "text"}
								value={values[arg.name] || ""}
								placeholder={arg.placeholder || arg.description}
								onChange={(e) => onValueChange(arg.name, e.target.value)}
								onKeyDown={(e) => handleKeyDown(e, index)}
								onFocus={() => onFocusField(index)}
								className={cx(
									"w-full rounded-md border bg-surface px-3 py-2 text-sm",
									"focus:border-primary focus:outline-none",
									focusedFieldIndex === index ? "border-primary" : "border-border",
								)}
							/>
						</label>
					))}
				</div>
			)}

			{/* Action buttons */}
			<div className="mt-4 flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-md px-3 py-1.5 text-muted-fg text-sm hover:bg-muted hover:text-fg"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={onExecute}
					className="rounded-md bg-primary px-3 py-1.5 text-primary-fg text-sm hover:bg-primary/90"
				>
					Execute
				</button>
			</div>
		</div>
	)
}
