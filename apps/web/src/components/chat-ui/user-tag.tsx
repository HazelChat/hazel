import type { User } from "@maki-chat/zero"
import { twMerge } from "tailwind-merge"

export function UserTag(props: { user: User | undefined; className?: string }) {
	return (
		<span class={twMerge(props.className, "text-muted-foreground text-sm hover:underline")}>
			@{props.user?.tag}
		</span>
	)
}
