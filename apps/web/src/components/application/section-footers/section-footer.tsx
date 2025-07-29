import type { ComponentPropsWithRef } from "react"
import { cx } from "~/utils/cx"

const SectionFooterRoot = ({ isCard, ...props }: ComponentPropsWithRef<"div"> & { isCard?: boolean }) => (
	<div
		{...props}
		className={cx(
			"flex items-center border-secondary border-t",
			isCard ? "gap-4 px-4 py-3 md:py-4 lg:px-6" : "gap-5 pt-4 md:pt-5",
			props.className,
		)}
	>
		{props.children}
	</div>
)

const SectionFooterActions = (props: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cx("flex flex-1 justify-end gap-3", props.className)}>
		{props.children}
	</div>
)

export const SectionFooter = {
	Root: SectionFooterRoot,
	Actions: SectionFooterActions,
}
