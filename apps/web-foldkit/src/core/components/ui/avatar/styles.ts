export type AvatarSize =
	| "xxs"
	| "xs"
	| "sm"
	| "md"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl"
	| "5xl"
	| "6xl"
	| "7xl"
	| "8xl"
	| "9xl"

export const styles: Record<AvatarSize, { root: string; initials: string; icon: string }> = {
	xxs: {
		root: "size-4 outline-[0.5px] -outline-offset-[0.5px]",
		initials: "text-xs font-semibold",
		icon: "size-3",
	},
	xs: {
		root: "size-6 outline-[0.5px] -outline-offset-[0.5px]",
		initials: "text-xs font-semibold",
		icon: "size-4",
	},
	sm: {
		root: "size-8 outline-[0.75px] -outline-offset-[0.75px]",
		initials: "text-sm font-semibold",
		icon: "size-5",
	},
	md: { root: "size-10 outline-1 -outline-offset-1", initials: "text-md font-semibold", icon: "size-6" },
	lg: { root: "size-12 outline-1 -outline-offset-1", initials: "text-lg font-semibold", icon: "size-7" },
	xl: { root: "size-14 outline-1 -outline-offset-1", initials: "text-xl font-semibold", icon: "size-8" },
	"2xl": {
		root: "size-16 outline-1 -outline-offset-1",
		initials: "text-display-xs font-semibold",
		icon: "size-8",
	},
	"3xl": {
		root: "size-20 outline-1 -outline-offset-1",
		initials: "text-display-sm font-semibold",
		icon: "size-10",
	},
	"4xl": {
		root: "size-24 outline-1 -outline-offset-1",
		initials: "text-display-md font-semibold",
		icon: "size-12",
	},
	"5xl": {
		root: "size-28 outline-1 -outline-offset-1",
		initials: "text-display-lg font-semibold",
		icon: "size-14",
	},
	"6xl": {
		root: "size-32 outline-1 -outline-offset-1",
		initials: "text-display-xl font-semibold",
		icon: "size-16",
	},
	"7xl": {
		root: "size-36 outline-1 -outline-offset-1",
		initials: "text-display-2xl font-semibold",
		icon: "size-18",
	},
	"8xl": {
		root: "size-40 outline-1 -outline-offset-1",
		initials: "text-display-2xl font-semibold",
		icon: "size-20",
	},
	"9xl": {
		root: "size-44 outline-1 -outline-offset-1",
		initials: "text-display-2xl font-semibold",
		icon: "size-24",
	},
}
