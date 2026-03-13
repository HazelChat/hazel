import { useLayoutEffect } from "react"
import { cx } from "~/utils/cx"
import { useAvatarContext } from "./avatar-context"

export interface AvatarImageProps {
	src?: string | null
	alt?: string
	className?: string
}

export function AvatarImage({ src, alt, className }: AvatarImageProps) {
	const { isSquare, isFailed, setIsFailed, setImageShowing } = useAvatarContext()

	const shouldShow = Boolean(src) && !isFailed

	// Sync image visibility state with context (useLayoutEffect prevents flash)
	useLayoutEffect(() => {
		setImageShowing(shouldShow)
		return () => setImageShowing(false)
	}, [shouldShow, setImageShowing])

	if (!shouldShow) return null

	return (
		<img
			data-avatar-img
			className={cx("size-full object-cover", isSquare ? "rounded-xl" : "rounded-3xl", className)}
			style={{
				// @ts-expect-error cornerShape is a non-standard CSS property
				cornerShape: "squircle",
			}}
			src={src!}
			alt={alt}
			onError={() => setIsFailed(true)}
		/>
	)
}
