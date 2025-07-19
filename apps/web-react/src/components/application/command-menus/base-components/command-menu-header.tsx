import type { ReactNode } from "react"
import { Header as AriaHeader } from "react-aria-components"
import { cx } from "@/utils/cx"

interface CommandMenuHeaderProps {
	children: ReactNode
	size?: "sm" | "md"
	className?: string
}

const sizes = {
	sm: "px-4.5 ",
	md: "px-5.5",
}

export const CommandMenuHeader = ({ children: title, size = "md", className }: CommandMenuHeaderProps) => {
	return (
		<AriaHeader className={cx("flex pt-2 text-sm font-medium text-tertiary", sizes[size], className)}>
			{title}
		</AriaHeader>
	)
}
