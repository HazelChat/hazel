import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "~/lib/utils"

const styles = {
	sm: {
		heading: "gap-0.5 text-sm font-semibold",
		subheading: "text-sm",
	},
	md: {
		heading: "gap-1 text-md font-semibold",
		subheading: "text-md",
	},
}

interface SectionLabelRootProps {
	title: ReactNode
	size?: "sm" | "md"
	isRequired?: boolean
	description?: ReactNode
	children?: ReactNode
	className?: string
}

export const SectionLabelRoot = ({
	size = "sm",
	isRequired,
	title,
	description,
	className,
	children,
}: SectionLabelRootProps) => {
	return (
		<div className={className}>
			<h3 className={cn("flex items-center text-fg", styles[size].heading)}>
				{title}
				<span className={cn("hidden text-primary", isRequired && "block")}>*</span>
			</h3>

			{description && <p className={cn("text-muted-fg", styles[size].subheading)}>{description}</p>}
			{children}
		</div>
	)
}

const SectionLabelActions = ({ className, children, ...props }: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cn("mt-3 flex gap-2", className)}>
		{children}
	</div>
)

export const SectionLabel = {
	Root: SectionLabelRoot,
	Actions: SectionLabelActions,
}
