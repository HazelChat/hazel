import type { ButtonProps as AriaButtonProps } from "react-aria-components"
import IconPlus from "~/components/icons/icon-plus"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"
import { cx } from "~/utils/cx"

const sizes = {
	xs: { root: "size-6", icon: "size-4" },
	sm: { root: "size-8", icon: "size-4" },
	md: { root: "size-10", icon: "size-5" },
}

interface AvatarAddButtonProps extends AriaButtonProps {
	size: "xs" | "sm" | "md"
	title?: string
	className?: string
}

export const AvatarAddButton = ({ size, className, title = "Add user", ...props }: AvatarAddButtonProps) => (
	<Tooltip>
		<TooltipTrigger
			{...props}
			aria-label={title}
			className={cx(
				"flex cursor-pointer items-center justify-center rounded-full border border-primary border-dashed bg-primary-subtle text-muted-fg outline-ring transition duration-100 ease-linear hover:bg-primary hover:text-primary-fg focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border-border disabled:bg-secondary disabled:text-muted-fg",
				sizes[size].root,
				className,
			)}
		>
			<IconPlus className={cx("text-current transition-inherit-all", sizes[size].icon)} />
		</TooltipTrigger>
		<TooltipContent>{title}</TooltipContent>
	</Tooltip>
)
