import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState, type ChangeEvent } from "react"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import {
	Modal,
	ModalBody,
	ModalClose,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"
import { exitToast } from "~/lib/toast-exit"

type ChatSyncProvider = "discord" | "slack"

interface DiscordGuild {
	id: string
	name: string
	icon: string | null
	owner: boolean
}

interface SlackWorkspace {
	id: string
	name: string
}

interface WorkspaceOption {
	id: string
	name: string
	badge?: string
}

const PROVIDER_LABELS: Record<ChatSyncProvider, string> = {
	discord: "Discord",
	slack: "Slack",
}

const PROVIDER_BRAND_COLOR: Record<ChatSyncProvider, string> = {
	discord: "#5865F2",
	slack: "#4A154B",
}

interface AddConnectionModalProps {
	organizationId: OrganizationId
	orgSlug: string
	provider: ChatSyncProvider
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

function ProviderIcon({ provider }: { provider: ChatSyncProvider }) {
	if (provider === "slack") {
		return (
			<svg viewBox="0 0 127 127" className="size-6" aria-hidden>
				<path
					d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z"
					fill="#E01E5A"
				/>
				<path
					d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z"
					fill="#36C5F0"
				/>
				<path
					d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z"
					fill="#2EB67D"
				/>
				<path
					d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z"
					fill="#ECB22E"
				/>
			</svg>
		)
	}

	return (
		<svg viewBox="0 0 24 24" className="size-6" fill="#5865F2" aria-hidden>
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	)
}

export function AddConnectionModal({
	organizationId,
	orgSlug,
	provider,
	isOpen,
	onClose,
	onSuccess,
}: AddConnectionModalProps) {
	const navigate = useNavigate()
	const providerLabel = PROVIDER_LABELS[provider]
	const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceOption | null>(null)
	const [workspaceSearch, setWorkspaceSearch] = useState("")
	const [isCreating, setIsCreating] = useState(false)

	const discordGuildsResult = useAtomValue(
		HazelApiClient.query("integration-resources", "getDiscordGuilds", {
			path: { orgId: organizationId },
		}),
	)

	const slackWorkspacesResult = useAtomValue(
		HazelApiClient.query("integration-resources", "getSlackWorkspaces", {
			path: { orgId: organizationId },
		}),
	)

	const createConnection = useAtomSet(HazelRpcClient.mutation("chatSync.connection.create"), {
		mode: "promiseExit",
	})

	const workspaces = useMemo<WorkspaceOption[]>(() => {
		if (provider === "discord") {
			return Result.builder(discordGuildsResult)
				.onSuccess((data) =>
					(data?.guilds ?? []).map((guild: DiscordGuild) => ({
						id: guild.id,
						name: guild.name,
						badge: guild.owner ? "Owner" : undefined,
					})),
				)
				.orElse(() => [])
		}

		return Result.builder(slackWorkspacesResult)
			.onSuccess((data) =>
				(data?.workspaces ?? []).map((workspace: SlackWorkspace) => ({
					id: workspace.id,
					name: workspace.name,
				})),
			)
			.orElse(() => [])
	}, [provider, discordGuildsResult, slackWorkspacesResult])

	const isWorkspaceLoading =
		provider === "discord"
			? Result.isInitial(discordGuildsResult)
			: Result.isInitial(slackWorkspacesResult)
	const isWorkspaceFailure =
		provider === "discord"
			? Result.isFailure(discordGuildsResult)
			: Result.isFailure(slackWorkspacesResult)
	const isWorkspaceReady =
		provider === "discord"
			? Result.isSuccess(discordGuildsResult)
			: Result.isSuccess(slackWorkspacesResult)

	const filteredWorkspaces =
		workspaceSearch.trim().length === 0
			? workspaces
			: workspaces.filter((workspace) =>
					workspace.name.toLowerCase().includes(workspaceSearch.toLowerCase()),
				)

	const handleClose = () => {
		setSelectedWorkspace(null)
		setWorkspaceSearch("")
		onClose()
	}

	const handleConnectProvider = () => {
		navigate({
			to: "/$orgSlug/settings/integrations/$integrationId",
			params: {
				orgSlug,
				integrationId: provider,
			},
		})
	}

	const handleSubmit = async () => {
		if (!selectedWorkspace) return
		setIsCreating(true)

		const exit = await createConnection({
			payload: {
				organizationId,
				provider,
				externalWorkspaceId: selectedWorkspace.id,
				externalWorkspaceName: selectedWorkspace.name,
			},
		})

		exitToast(exit)
			.onSuccess(() => {
				onSuccess()
				handleClose()
			})
			.successMessage(`${providerLabel} connection created`)
			.onErrorTag("ChatSyncConnectionExistsError", () => ({
				title: "Connection already exists",
				description: `A connection to this ${providerLabel} workspace already exists in your organization.`,
				isRetryable: false,
			}))
			.onErrorTag("ChatSyncIntegrationNotConnectedError", () => ({
				title: `${providerLabel} not connected`,
				description: `Connect ${providerLabel} first to load available workspaces.`,
				isRetryable: false,
			}))
			.run()

		setIsCreating(false)
	}

	return (
		<Modal>
			<ModalContent isOpen={isOpen} onOpenChange={(open) => !open && handleClose()} size="md">
				<ModalHeader>
					<div className="flex items-center gap-3">
						<div
							className="flex size-10 items-center justify-center rounded-xl"
							style={{ backgroundColor: `${PROVIDER_BRAND_COLOR[provider]}10` }}
						>
							<ProviderIcon provider={provider} />
						</div>
						<ModalTitle>Connect {providerLabel} Workspace</ModalTitle>
					</div>
				</ModalHeader>

				<ModalBody className="flex flex-col gap-5">
					{isWorkspaceLoading && (
						<div className="flex items-center justify-center py-8">
							<div className="flex items-center gap-3 text-muted-fg">
								<div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
								<span className="text-sm">Loading {providerLabel} workspaces...</span>
							</div>
						</div>
					)}

					{isWorkspaceFailure && (
						<div className="rounded-lg border border-border bg-bg-muted/20 p-4">
							<p className="font-medium text-fg text-sm">Connect {providerLabel} first</p>
							<p className="mt-1 text-muted-fg text-sm">
								Authorize {providerLabel} in Integrations so we can load your workspaces.
							</p>
							<Button
								intent="secondary"
								size="sm"
								onPress={handleConnectProvider}
								className="mt-3"
							>
								Open {providerLabel} Integration
							</Button>
						</div>
					)}

					{isWorkspaceReady && (
						<div className="flex flex-col gap-3">
							<Label>{providerLabel} Workspace</Label>
							{selectedWorkspace ? (
								<div className="flex items-center justify-between rounded-lg border border-border bg-bg-muted/30 px-3 py-2.5">
									<div className="flex items-center gap-2">
										<span className="font-medium text-fg text-sm">
											{selectedWorkspace.name}
										</span>
									</div>
									<button
										type="button"
										onClick={() => setSelectedWorkspace(null)}
										className="text-muted-fg text-xs transition-colors hover:text-fg"
									>
										Change
									</button>
								</div>
							) : (
								<>
									<InputGroup>
										<Input
											placeholder={`Search ${providerLabel} workspaces...`}
											value={workspaceSearch}
											onChange={(e: ChangeEvent<HTMLInputElement>) =>
												setWorkspaceSearch(e.target.value)
											}
											autoFocus
										/>
									</InputGroup>
									<div className="max-h-56 overflow-y-auto rounded-lg border border-border">
										{filteredWorkspaces.length === 0 ? (
											<div className="px-3 py-6 text-center text-muted-fg text-sm">
												No {providerLabel} workspaces found
											</div>
										) : (
											filteredWorkspaces.map((workspace) => (
												<button
													key={workspace.id}
													type="button"
													onClick={() => setSelectedWorkspace(workspace)}
													className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50"
												>
													<span className="truncate text-fg">{workspace.name}</span>
													{workspace.badge && (
														<span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-fg">
															{workspace.badge}
														</span>
													)}
												</button>
											))
										)}
									</div>
								</>
							)}
							<Description>
								Select the {providerLabel} workspace you want to sync with Hazel.
							</Description>
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<ModalClose intent="secondary">Cancel</ModalClose>
					<Button
						intent="primary"
						onPress={handleSubmit}
						isDisabled={!selectedWorkspace || isCreating || !isWorkspaceReady}
						isPending={isCreating}
						style={{ backgroundColor: PROVIDER_BRAND_COLOR[provider] }}
					>
						{isCreating ? "Connecting..." : "Connect"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
