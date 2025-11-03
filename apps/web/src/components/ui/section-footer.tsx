import type { ComponentPropsWithRef } from "react"
import { cn } from "~/lib/utils"

const SectionFooterRoot = ({
	isCard,
	className,
	children,
	...props
}: ComponentPropsWithRef<"div"> & { isCard?: boolean }) => (
	<div
		{...props}
		className={cn(
			"flex items-center border-border border-t",
			isCard ? "gap-4 px-4 py-3 md:py-4 lg:px-6" : "gap-5 pt-4 md:pt-5",
			className,
		)}
	>
		{children}
	</div>
)

const SectionFooterActions = ({ className, children, ...props }: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cn("flex flex-1 justify-end gap-3", className)}>
		{children}
	</div>
)

export const SectionFooter = {
	Root: SectionFooterRoot,
	Actions: SectionFooterActions,
}
