"use client"

import { Toolbar as ToolbarPrimitive, type ToolbarProps } from "react-aria-components"
import { cx } from "~/lib/primitive"

function Toolbar({ className, orientation = "horizontal", ...props }: ToolbarProps) {
	return (
		<ToolbarPrimitive
			orientation={orientation}
			className={cx("flex items-center gap-px", className)}
			{...props}
		/>
	)
}

export { Toolbar }
export type { ToolbarProps }
