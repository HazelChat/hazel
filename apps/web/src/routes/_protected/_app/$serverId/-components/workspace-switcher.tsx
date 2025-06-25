import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { Link, useParams } from "@tanstack/solid-router"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"

import { IconCopy1, IconPlusStroke, IconSpinnerStroke, IconUserPlus1 } from "~/components/iconsv2"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Dialog } from "~/components/ui/dialog"
import { Menu } from "~/components/ui/menu"
import { Sidebar } from "~/components/ui/sidebar"
import { toaster } from "~/components/ui/toaster"
import { createMutation } from "~/lib/convex"
import { convexQuery } from "~/lib/convex-query"
import { CreateServerDialog } from "./create-server-dialog"

export const WorkspaceSwitcher = () => {
	const params = useParams({
		from: "/_protected/_app/$serverId",
	})

	const [createDialogOpen, setCreateDialogOpen] = createSignal(false)
	const [inviteDialogOpen, setInviteDialogOpen] = createSignal(false)
	const [inviteCode, setInviteCode] = createSignal<string | null>(null)
	const [generating, setGenerating] = createSignal(false)

	const createInvite = createMutation(api.invites.createInvite)

	const serversQuery = useQuery(() => convexQuery(api.servers.getServersForUser, {}))

	const activeServer = createMemo(() =>
		serversQuery.data?.find((server) => server._id === params().serverId),
	)

	return (
		<>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Menu>
						<Menu.Trigger
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
							asChild={(props) => (
								<Sidebar.MenuButton size="lg" {...props()}>
									<Avatar
										size="sm"
										src={activeServer()?.imageUrl}
										name={activeServer()?.name!}
									/>
								</Sidebar.MenuButton>
							)}
						/>
						<Menu.Content class="min-w-56 rounded-lg">
							<Menu.ItemGroup>
								<Menu.Label>Servers</Menu.Label>
								<For each={serversQuery.data}>
									{(server) => (
										<Menu.Item
											class="flex items-center gap-2"
											value={server._id}
											asChild={(props) => (
												<Link
													to="/$serverId"
													params={{
														serverId: server._id,
													}}
													{...props()}
												/>
											)}
										>
											<Avatar size="xs" src={server.imageUrl} name={server.name} />
											<span class="truncate text-muted-foreground text-xs">
												{server.name}
											</span>
										</Menu.Item>
									)}
								</For>
							</Menu.ItemGroup>
							<Menu.Separator />
							<Menu.ItemGroup>
								<Menu.Item
									value="add-server"
									class="gap-2 p-2"
									onSelect={() => setCreateDialogOpen(true)}
								>
									<IconPlusStroke class="size-4" />
									<div class="font-medium text-muted-foreground">Add Server</div>
								</Menu.Item>
								<Menu.Item
									value="invite"
									class="gap-2 p-2"
									onSelect={() => {
										setInviteDialogOpen(true)
									}}
								>
									<IconUserPlus1 class="size-4" />
									<div class="font-medium text-muted-foreground">Invite People</div>
								</Menu.Item>
							</Menu.ItemGroup>
						</Menu.Content>
					</Menu>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
			<CreateServerDialog open={createDialogOpen()} onOpenChange={setCreateDialogOpen} />

			{/* Invite Dialog */}
			<Dialog open={inviteDialogOpen()} onOpenChange={(d) => setInviteDialogOpen(d.open)}>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title class="flex items-center gap-2 font-semibold text-lg">
							Invite members to
							<Avatar size="xs" src={activeServer()?.imageUrl} name={activeServer()?.name!} />
							{activeServer()?.name}
						</Dialog.Title>
					</Dialog.Header>

					<div class="mt-4 flex flex-col gap-4">
						<textarea
							placeholder="example@gmail.com"
							rows={4}
							class="w-full rounded-md border bg-background p-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>

						<div class="flex items-center justify-between">
							<Show
								when={inviteCode() !== null}
								fallback={
									<Button
										intent="secondary"
										disabled={generating()}
										onClick={async () => {
											try {
												setGenerating(true)
												const res = await createInvite({
													serverId: params().serverId as any,
												})

												navigator.clipboard.writeText(
													`${window.location.origin}/invite/${res.code}`,
												)

												toaster.success({ title: "Copied invite link" })
												setInviteCode(res.code)
											} catch (err) {
												console.error(err)
												toaster.error({ title: "Failed to create invite" })
											} finally {
												setGenerating(false)
											}
										}}
									>
										<Show
											when={generating()}
											fallback={
												<span class="flex flex-row items-center gap-2">
													<IconCopy1 /> Copy link
												</span>
											}
										>
											<IconSpinnerStroke class="mr-2 size-4 animate-spin" /> Generating
										</Show>
									</Button>
								}
							>
								<Button
									intent="secondary"
									onClick={() => {
										navigator.clipboard.writeText(
											`${window.location.origin}/invite/${inviteCode()}`,
										)
										toaster.success({ title: "Copied invite link" })
									}}
								>
									<IconCopy1 />
									Copy link
								</Button>
							</Show>

							<Button intent="default" disabled>
								Send invites
							</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog>

			{/* Reset when dialog closes */}
			{createEffect(() => {
				if (!inviteDialogOpen()) {
					setInviteCode(null)
					setGenerating(false)
				}
			})}
		</>
	)
}
