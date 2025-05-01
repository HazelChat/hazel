import { useQuery } from "@rocicorp/zero/solid"
import { useParams } from "@tanstack/solid-router"
import { useAuth } from "clerk-solidjs"
import { For, Show, createMemo } from "solid-js"
import { useZero } from "~/lib/zero-context"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { TextField } from "../ui/text-field"

export function ChatTopbar() {
	const params = useParams({ from: "/_app/$serverId/chat/$id" })()
	const z = useZero()

	const { userId } = useAuth()

	const [channel] = useQuery(() => z.query.serverChannels.where("id", "=", params.id).related("users").one())

	if (!channel) {
		return null
	}

	const friends = createMemo(() => channel()?.users.filter((user) => user.id !== userId()) ?? [])
	const isSingleDm = createMemo(() => friends().length === 1)

	return (
		<div class="flex h-16 items-center justify-between gap-2 border-b bg-sidebar p-3">
			<div class="flex items-center gap-2">
				<Show when={isSingleDm()}>
					<Avatar>
						<AvatarImage src={friends()[0].avatarUrl} alt={friends()[0].displayName} />
						<AvatarFallback>{friends()[0].displayName.slice(0, 2)}</AvatarFallback>
					</Avatar>
				</Show>
				<Show when={!isSingleDm()}>
					<div class="-space-x-4 flex items-center justify-center">
						<For each={friends()}>
							{(friend) => (
								<Avatar>
									<AvatarImage src={friend.avatarUrl} alt={friend.displayName} />
									<AvatarFallback>{friend.displayName.slice(0, 2)}</AvatarFallback>
								</Avatar>
							)}
						</For>
					</div>
				</Show>
				<p class="text-sidebar-fg">
					{friends()
						.map((friend) => friend.displayName)
						.join(", ")}
				</p>
			</div>
			<div class="flex gap-2">
				<Button size="icon" intent="ghost">
					<HeadsetIcon />
				</Button>
				{/* <PinnedModal channelId={channelId} /> */}
				<Button size="icon" intent="ghost">
					<UserPlus />
				</Button>
				<Button size="icon" intent="ghost">
					<Users />
				</Button>
				<div>
					<TextField aria-label="Search" placeholder="Search" suffix={<Search />} />
				</div>
			</div>
		</div>
	)
}

// Placeholder icons
function HeadsetIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-headset-icon lucide-headset"
		>
			<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
			<path d="M21 16v2a4 4 0 0 1-4 4h-5" />
		</svg>
	)
}

function UserPlus() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-user-round-plus-icon lucide-user-round-plus"
		>
			<path d="M2 21a8 8 0 0 1 13.292-6" />
			<circle cx="10" cy="8" r="5" />
			<path d="M19 16v6" />
			<path d="M22 19h-6" />
		</svg>
	)
}

function Users() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-users-icon lucide-users"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	)
}

function Search() {
	// FYI if we continue to use this: I added an mr-2 inline here, please move it out.
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-search-icon lucide-search mr-2"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
	)
}
