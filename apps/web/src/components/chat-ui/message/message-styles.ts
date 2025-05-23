import { tv } from "tailwind-variants"

export const chatMessageStyles = tv({
	base: "group relative flex flex-col px-4 py-0.5 transition-colors hover:bg-muted/50",
	variants: {
		variant: {
			chat: "rounded-l-none rounded-md",
			pinned: "border p-3 rounded-md",
		},
		isFirstNewMessage: {
			true: "border-emerald-500 border-l-2 bg-emerald-500/20 hover:bg-emerald-500/15",
			false: "",
		},
		isGettingRepliedTo: {
			true: "border-primary border-l-2 bg-primary/20 hover:bg-primary/15",
			false: "",
		},
		isGroupStart: {
			true: "mt-2",
			false: "",
		},
		isGroupEnd: {
			true: "mb-2",
			false: "",
		},
		isPinned: {
			true: "border-primary border-l-2 bg-primary/20 hover:bg-primary/15",
			false: "",
		},
	},
	defaultVariants: {
		variant: "chat",
		isPinned: false,
		isGettingRepliedTo: false,
		isGroupStart: false,
		isGroupEnd: false,
	},
})
