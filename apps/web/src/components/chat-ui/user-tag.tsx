import type { Doc } from "@hazel/backend"
import { twMerge } from "tailwind-merge"

export function UserTag(props: { user: Doc<"users"> | undefined; className?: string }) {
	return (
		<span class={twMerge(props.className, "text-muted-foreground text-sm hover:underline")}>
			@{props.user?.tag}
		</span>
	)
}
