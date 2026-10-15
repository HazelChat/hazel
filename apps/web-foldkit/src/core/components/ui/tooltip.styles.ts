import { tv } from "tailwind-variants"

export const tooltipStyles = tv({
	base: [
		"group max-w-sm origin-(--trigger-anchor-point) rounded-lg border border-(--tooltip-border) px-2.5 py-1.5 text-sm/6 will-change-transform [--tooltip-border:var(--color-muted-fg)]/30 dark:shadow-none *:[strong]:font-medium",
	],
	variants: {
		inverse: {
			true: ["border-transparent bg-fg text-bg", "**:[.text-muted-fg]:text-bg/60"],
			false: "bg-overlay text-overlay-fg",
		},
		isEntering: {
			true: [
				"fade-in animate-in",
				"data-[placement=left]:slide-in-from-right-1 data-[placement=right]:slide-in-from-left-1 data-[placement=top]:slide-in-from-bottom-1 data-[placement=bottom]:slide-in-from-top-1",
			],
		},
		isExiting: {
			true: [
				"fade-in direction-reverse animate-in",
				"data-[placement=left]:slide-out-to-right-1 data-[placement=right]:slide-out-to-left-1 data-[placement=top]:slide-out-to-bottom-1 data-[placement=bottom]:slide-out-to-top-1",
			],
		},
	},
	defaultVariants: {
		inverse: false,
	},
})

/** Arrow classes, joined by `twJoin` with the inverse or default fill. */
export const tooltipArrowBase =
	"block group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
export const tooltipArrowInverse = "fill-fg stroke-transparent"
export const tooltipArrowDefault = "fill-overlay stroke-(--tooltip-border)"
