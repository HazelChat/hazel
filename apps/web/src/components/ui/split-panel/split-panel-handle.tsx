import { tv } from "tailwind-variants"

const handleStyles = tv({
	base: [
		"absolute top-0 z-10 h-full w-1 cursor-col-resize",
		"bg-transparent transition-colors duration-150",
		"hover:bg-primary/20",
		"focus:outline-none focus-visible:bg-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
		"active:bg-primary/40",
	],
	variants: {
		position: {
			left: "right-0 translate-x-1/2",
			right: "left-0 -translate-x-1/2",
		},
		isDragging: {
			true: "bg-primary/40",
		},
	},
	defaultVariants: {
		position: "right",
		isDragging: false,
	},
})

const indicatorStyles = tv({
	base: [
		"absolute top-1/2 h-8 w-1 -translate-y-1/2 rounded-full",
		"bg-border opacity-0 transition-opacity duration-150",
		"group-hover:opacity-100 group-focus-visible:opacity-100",
	],
	variants: {
		position: {
			left: "left-0",
			right: "left-0",
		},
		isDragging: {
			true: "opacity-100 bg-primary",
		},
	},
	defaultVariants: {
		position: "right",
		isDragging: false,
	},
})

export interface SplitPanelHandleProps {
	/** Props from usePanelResize hook */
	handleProps: {
		onPointerDown: (e: React.PointerEvent) => void
		onKeyDown: (e: React.KeyboardEvent) => void
		tabIndex: number
		role: "separator"
		"aria-orientation": "vertical"
		"aria-valuenow": number
		"aria-valuemin": number
		"aria-valuemax": number
		"aria-label": string
	}
	/** Panel position */
	position?: "left" | "right"
	/** Whether currently dragging */
	isDragging?: boolean
	/** Additional className */
	className?: string
}

export function SplitPanelHandle({
	handleProps,
	position = "right",
	isDragging = false,
	className,
}: SplitPanelHandleProps) {
	return (
		<div {...handleProps} className={handleStyles({ position, isDragging, className })} data-dragging={isDragging}>
			<div className={indicatorStyles({ position, isDragging })} />
		</div>
	)
}
