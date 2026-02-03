import type { FC, ReactNode } from "react"
import { Facehash } from "facehash"
import IconCircleDottedUser from "~/components/icons/icon-circle-dotted-user"
import { cx } from "~/utils/cx"
import { useAvatarContext } from "./avatar-context"
import { styles } from "./styles"

export interface AvatarFallbackProps {
	children?: ReactNode
	icon?: FC<{ className?: string }>
	className?: string
}

export function AvatarFallback({ children, icon: Icon, className }: AvatarFallbackProps) {
	const { size, isSquare, imageShowing, seed } = useAvatarContext()

	// Only render fallback when image is not showing (no src or failed to load)
	if (imageShowing) return null

	if (typeof children === "string") {
		return <span className={cx("text-quaternary", styles[size].initials, className)}>{children}</span>
	}

	if (Icon) {
		return <Icon className={cx("text-muted-fg", styles[size].icon, className)} />
	}

	if (children) {
		return <>{children}</>
	}

	if (seed) {
		return (
			<div
				className={cx(
					"absolute inset-0 overflow-hidden",
					isSquare ? "rounded-xl" : "rounded-full",
					className,
				)}
				style={{
					// @ts-expect-error cornerShape is a non-standard CSS property
					cornerShape: "squircle",
				}}
			>
				<Facehash
					name={seed}
					size="100%"
					colorClasses={[
						"bg-pink-500",
						"bg-blue-500",
						"bg-green-500",
						"bg-yellow-500",
						"bg-purple-500",
						"bg-orange-500",
						"bg-red-500",
					]}
					variant="gradient"
					intensity3d="dramatic"
					interactive={false}
					showInitial={true}
					aria-hidden="true"
				/>
			</div>
		)
	}

	return <IconCircleDottedUser className={cx("text-muted-fg", styles[size].icon, className)} />
}
