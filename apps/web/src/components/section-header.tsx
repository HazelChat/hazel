import { cx } from "~/utils/cx"

export function SectionHeader({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cx("w-full", className)} {...props} />
}
export function SectionTitle({ className, ...props }: React.ComponentProps<"h1">) {
	return <h1 className={cx("w-full font-semibold text-xl sm:text-2xl/10", className)} {...props} />
}
export function SectionDescription({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cx("w-full text-pretty text-base/6 text-tertiary", className)} {...props} />
}
