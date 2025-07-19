import { HelpCircle } from "@untitledui/icons"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip"
import { cx } from "@/utils/cx"

const styles = {
	sm: {
		heading: "text-sm font-semibold gap-0.5",
		subheading: "text-sm",
	},
	md: {
		heading: "text-md font-semibold gap-1",
		subheading: "text-md",
	},
}

interface SectionLabelRootProps {
	title: ReactNode
	size?: "sm" | "md"
	isRequired?: boolean
	description?: ReactNode
	tooltip?: string
	tooltipDescription?: string
	children?: ReactNode
	className?: string
}

export const SectionLabelRoot = ({
	size = "sm",
	isRequired,
	title,
	description,
	tooltip,
	tooltipDescription,
	className,
	children,
}: SectionLabelRootProps) => {
	return (
		<div className={className}>
			<h3 className={cx("flex items-center text-secondary", styles[size].heading)}>
				{title}

				<span className={cx("hidden text-brand-tertiary", isRequired && "block")}>*</span>

				{(tooltip || tooltipDescription) && (
					<Tooltip title={tooltip} description={tooltipDescription}>
						<TooltipTrigger className="text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
							<HelpCircle className="size-4" />
						</TooltipTrigger>
					</Tooltip>
				)}
			</h3>

			{description && <p className={cx("text-tertiary", styles[size].subheading)}>{description}</p>}
			{children}
		</div>
	)
}

const SectionLabelActions = (props: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cx("mt-3 flex gap-2", props.className)}>
		{props.children}
	</div>
)

export const SectionLabel = {
	Root: SectionLabelRoot,
	Actions: SectionLabelActions,
}
