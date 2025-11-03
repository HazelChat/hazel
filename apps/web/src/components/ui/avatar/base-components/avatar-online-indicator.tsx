import { cx } from "~/utils/cx"

const sizes = {
	xs: "size-1.5",
	sm: "size-2",
	md: "size-2.5",
	lg: "size-3",
	xl: "size-3.5",
	"2xl": "size-4",
	"3xl": "size-4.5",
	"4xl": "size-5",
	"5xl": "size-5.5",
	"6xl": "size-6",
	"7xl": "size-6.5",
	"8xl": "size-7",
	"9xl": "size-8",
}

interface AvatarOnlineIndicatorProps {
	size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl"
	status: "online" | "offline"
	className?: string
}

export const AvatarOnlineIndicator = ({ size, status, className }: AvatarOnlineIndicatorProps) => (
	<span
		className={cx(
			"absolute right-0 bottom-0 rounded-full ring-[1.5px] ring-bg",
			status === "online" ? "bg-success" : "bg-muted",
			sizes[size],
			className,
		)}
	/>
)
