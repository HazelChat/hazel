import { useState } from "react"
import type { ReactNode } from "react"
import { cx } from "~/utils/cx"
import { AvatarContext, type AvatarSize } from "./avatar-context"
import { styles } from "./styles"

export interface AvatarRootProps {
	size?: AvatarSize
	isSquare?: boolean
	contrastBorder?: boolean
	focusable?: boolean
	className?: string
	children: ReactNode
	seed?: string
	/**
	 * Optional: Pass the image src to initialize state correctly and avoid flash.
	 * Used internally by the Avatar convenience wrapper.
	 */
	src?: string | null
}

export function AvatarRoot({
	size = "md",
	isSquare = true,
	contrastBorder = false,
	focusable = false,
	className,
	children,
	seed,
	src,
}: AvatarRootProps) {
	const [isFailed, setIsFailed] = useState(false)
	// Initialize imageShowing based on whether src exists (avoids flash for convenience wrapper)
	const [imageShowing, setImageShowing] = useState(Boolean(src))

	return (
		<AvatarContext value={{ size, isSquare, isFailed, setIsFailed, imageShowing, setImageShowing, seed }}>
			<div
				data-avatar
				data-slot="avatar"
				className={cx(
					"relative inline-flex shrink-0 items-center justify-center overflow-visible bg-muted outline-transparent",
					isSquare ? "rounded-xl" : "rounded-3xl",
					focusable &&
						"ring-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2",
					contrastBorder && "outline outline-border",
					styles[size].root,
					className,
				)}
				style={{
					// @ts-expect-error cornerShape is a non-standard CSS property
					cornerShape: "squircle",
				}}
			>
				{children}
			</div>
		</AvatarContext>
	)
}
