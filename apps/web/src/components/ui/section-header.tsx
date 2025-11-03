import type { ComponentPropsWithRef } from "react"
import { cn } from "~/lib/utils"

const SectionHeaderRoot = ({ className, children, ...props }: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cn("flex flex-col gap-5 border-border border-b pb-5", className)}>
		{children}
	</div>
)

const SectionHeaderGroup = ({ className, children, ...props }: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cn("relative flex flex-col items-start gap-4 md:flex-row", className)}>
		{children}
	</div>
)

const SectionHeaderActions = ({ className, children, ...props }: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cn("flex gap-3", className)}>
		{children}
	</div>
)

const SectionHeaderHeading = ({ className, children, ...props }: ComponentPropsWithRef<"h2">) => (
	<h2 {...props} className={cn("font-semibold text-fg text-lg", className)}>
		{children}
	</h2>
)

const SectionHeaderSubheading = ({ className, children, ...props }: ComponentPropsWithRef<"p">) => (
	<p {...props} className={cn("text-muted-fg text-sm", className)}>
		{children}
	</p>
)

export const SectionHeader = {
	Root: SectionHeaderRoot,
	Group: SectionHeaderGroup,
	Actions: SectionHeaderActions,
	Heading: SectionHeaderHeading,
	Subheading: SectionHeaderSubheading,
}
