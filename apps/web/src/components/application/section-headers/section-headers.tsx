import type { ComponentPropsWithRef } from "react"
import { cx } from "~/utils/cx"

const SectionHeaderRoot = (props: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cx("flex flex-col gap-5 border-secondary border-b pb-5", props.className)}>
		{props.children}
	</div>
)

const SectionHeaderGroup = (props: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cx("relative flex flex-col items-start gap-4 md:flex-row", props.className)}>
		{props.children}
	</div>
)

const SectionHeaderActions = (props: ComponentPropsWithRef<"div">) => (
	<div {...props} className={cx("flex gap-3", props.className)}>
		{props.children}
	</div>
)

const SectionHeaderHeading = (props: ComponentPropsWithRef<"h2">) => (
	<h2 {...props} className={cx("font-semibold text-lg text-primary", props.className)}>
		{props.children}
	</h2>
)

const SectionHeaderSubheading = (props: ComponentPropsWithRef<"p">) => (
	<p {...props} className={cx("text-sm text-tertiary", props.className)}>
		{props.children}
	</p>
)

export const SectionHeader = {
	Root: SectionHeaderRoot,
	Group: SectionHeaderGroup,
	Actions: SectionHeaderActions,
	Heading: SectionHeaderHeading,
	Subheading: SectionHeaderSubheading,
}
