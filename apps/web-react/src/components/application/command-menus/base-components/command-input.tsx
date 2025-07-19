import { HelpCircle, SearchLg } from "@untitledui/icons"
import type { ComponentPropsWithRef, ReactNode } from "react"
import type { InputProps as AriaInputProps } from "react-aria-components"
import { Group as AriaGroup, Input as AriaInput } from "react-aria-components"
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip"
import { cx } from "@/utils/cx"
import { CommandShortcut } from "./command-shortcut"

type CommandInputProps = AriaInputProps &
	ComponentPropsWithRef<"input"> & {
		placeholder?: string
		shortcutKeys?: string[]
		tooltip?: ReactNode
		className?: string
	}

export const CommandInput = ({
	placeholder,
	shortcutKeys,
	tooltip,
	className,
	...props
}: CommandInputProps) => {
	return (
		<AriaGroup
			className={({ isFocusWithin }) =>
				cx(
					"flex items-center gap-x-2 rounded-xl bg-primary p-4",
					isFocusWithin && "outline-2 outline-focus-ring",
					className,
				)
			}
		>
			<div className="pointer-events-none absolute">
				<SearchLg className="size-5 text-fg-quaternary" />
			</div>

			<AriaInput
				placeholder={placeholder}
				className="m-0 w-full bg-transparent pl-7 text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary"
				{...props}
			/>

			{tooltip && (
				<Tooltip title={tooltip} placement="top">
					<TooltipTrigger className="cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
						<HelpCircle className="size-4" />
					</TooltipTrigger>
				</Tooltip>
			)}

			{shortcutKeys && <CommandShortcut keys={shortcutKeys} />}
		</AriaGroup>
	)
}
