import type { Doc, Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { Link, useNavigate } from "@tanstack/solid-router"
import { type Accessor, Show } from "solid-js"
import { createMutation } from "~/lib/convex"
import { IconChat } from "../icons/chat"
import { IconProfile } from "../icons/profile"
import { Avatar, type AvatarProps } from "../ui/avatar"
import { Button } from "../ui/button"
import { Popover } from "../ui/popover"
import { Separator } from "../ui/separator"

interface UserPopoverContentProps {
	serverId: Accessor<Id<"servers">>
	user: Doc<"users">
}

export const UserPopoverContent = (props: UserPopoverContentProps) => {
	const navigate = useNavigate()

	const createDmChannelMutation = createMutation(api.channels.creatDmChannel)

	return (
		<div>
			<div class="flex flex-row gap-4 p-4">
				<Avatar src={props.user.avatarUrl} name={props.user.displayName} size="xxl" />
				<div>
					<p class="font-semibold text-xl">{props.user.displayName}</p>
					<p class="text-base text-muted-foreground">{props.user.tag}</p>
				</div>
			</div>
			<Separator />
			<div class="flex flex-row items-center gap-3 p-4">
				<Button
					intent="secondary"
					onClick={async () => {
						const channelId = await createDmChannelMutation({
							serverId: props.serverId(),
							userId: props.user._id,
						})

						navigate({
							to: "/$serverId/chat/$id",
							params: { id: channelId, serverId: props.serverId() },
						})
					}}
				>
					<IconChat class="size-4" />
					Message
				</Button>
				<Button
					intent="secondary"
					asChild={(parentProps) => (
						<Link
							to="/$serverId/profile/$id"
							params={{
								serverId: props.serverId(),
								id: props.user._id,
							}}
							{...parentProps()}
						/>
					)}
				>
					<IconProfile class="size-4" />
					View Profile
				</Button>
			</div>
		</div>
	)
}

export interface UserAvatarProps
	extends Omit<UserPopoverContentProps, "user">,
		Omit<AvatarProps, "name" | "src"> {
	user?: Doc<"users">
}

export const UserAvatar = (props: UserAvatarProps) => {
	return (
		<Show
			when={props.user}
			fallback={
				<Avatar
					name={props.user?.displayName ?? "Loading.."}
					src={props.user?.avatarUrl}
					{...props}
				/>
			}
		>
			<Popover lazyMount>
				<Popover.Trigger
					asChild={(popoverProps) => (
						<Avatar
							src={props.user!.avatarUrl}
							name={props.user!.displayName}
							{...props}
							{...popoverProps}
						/>
					)}
				/>
				<Popover.Content class="p-0">
					<UserPopoverContent {...props} user={props.user!} />
				</Popover.Content>
			</Popover>
		</Show>
	)
}
