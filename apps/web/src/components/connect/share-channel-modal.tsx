import { useAtomSet } from "@effect/atom-react"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { useCallback, useEffect, useRef, useState } from "react"
import { createConnectInviteMutation, workspaceSearchMutation } from "~/atoms/connect-share-atoms"
import { IconClose } from "~/components/icons/icon-close"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Loader } from "~/components/ui/loader"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { TextField } from "~/components/ui/text-field"
import { exitToastAsync } from "~/lib/toast-exit"

interface ShareChannelModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	channelId: ChannelId
	channelName: string
	organizationId: OrganizationId
}

interface WorkspaceResult {
	id: OrganizationId
	name: string
	slug: string | null
	logoUrl: string | null
}

export function ShareChannelModal({
	isOpen,
	onOpenChange,
	channelId,
	channelName,
	organizationId,
}: ShareChannelModalProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<WorkspaceResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceResult | null>(null)
	const [allowGuestMemberAdds, setAllowGuestMemberAdds] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const searchWorkspaces = useAtomSet(workspaceSearchMutation, { mode: "promiseExit" })
	const createInvite = useAtomSet(createConnectInviteMutation, { mode: "promiseExit" })

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [])

	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query)
			setSelectedWorkspace(null)

			if (debounceRef.current) clearTimeout(debounceRef.current)

			if (query.length < 2) {
				setSearchResults([])
				setIsSearching(false)
				return
			}

			setIsSearching(true)
			debounceRef.current = setTimeout(async () => {
				try {
					const exit = await searchWorkspaces({ payload: { query, organizationId } })
					if (exit._tag === "Success") {
						setSearchResults(
							exit.value.data.map((r) => ({
								id: r.id,
								name: r.name,
								slug: r.slug,
								logoUrl: r.logoUrl,
							})),
						)
					} else {
						console.error("[ShareChannel] workspace search failed:", exit)
						setSearchResults([])
					}
				} finally {
					setIsSearching(false)
				}
			}, 300)
		},
		[searchWorkspaces, organizationId],
	)

	const handleSubmit = async () => {
		const targetValue = selectedWorkspace?.slug ?? ""
		if (!targetValue) return

		setIsSubmitting(true)
		await exitToastAsync(
			createInvite({
				payload: {
					channelId,
					guestOrganizationId: selectedWorkspace?.id,
					target: { kind: "slug", value: targetValue },
					allowGuestMemberAdds,
				},
				reactivityKeys: [`connectInvites:outgoing:${organizationId}`],
			}),
		)
			.loading("Sending invite...")
			.onSuccess(() => {
				onOpenChange(false)
				resetState()
			})
			.successMessage("Invite sent")
			.onErrorTag("ConnectWorkspaceNotFoundError", () => ({
				title: "Workspace not found",
				description: "No workspace matches that name or slug.",
				isRetryable: false,
			}))
			.onErrorTag("ConnectChannelAlreadySharedError", () => ({
				title: "Already shared",
				description: "This channel is already shared with that organization.",
				isRetryable: false,
			}))
			.run()
		setIsSubmitting(false)
	}

	const resetState = () => {
		setSearchQuery("")
		setSearchResults([])
		setSelectedWorkspace(null)
		setAllowGuestMemberAdds(false)
	}

	const canSelectWorkspace = (workspace: WorkspaceResult) => !!workspace.slug
	const canSubmit = !!selectedWorkspace?.slug

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) resetState()
				onOpenChange(open)
			}}
		>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Share #{channelName}</ModalTitle>
					<Description>Invite another workspace to collaborate in this channel.</Description>
				</ModalHeader>

				<ModalBody className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<TextField>
							<Label>Workspace</Label>
							<Input
								placeholder="Search public workspaces by name or slug..."
								value={selectedWorkspace ? selectedWorkspace.name : searchQuery}
								onChange={(e) => {
									if (selectedWorkspace) {
										setSelectedWorkspace(null)
									}
									handleSearch(e.target.value)
								}}
							/>
						</TextField>

						{!selectedWorkspace && searchQuery.length >= 2 && (
							<div className="rounded-lg border border-border bg-bg">
								{isSearching ? (
									<div className="flex items-center justify-center py-6">
										<Loader />
									</div>
								) : searchResults.length === 0 ? (
									<div className="px-4 py-6 text-center text-muted-fg text-sm">
										No public workspaces found
									</div>
								) : (
									<div className="divide-y divide-border">
										{searchResults.map((workspace) => {
											const isShareable = canSelectWorkspace(workspace)

											return (
												<button
													key={workspace.id}
													type="button"
													disabled={!isShareable}
													onClick={() => {
														if (!isShareable) return
														setSelectedWorkspace(workspace)
														setSearchQuery("")
														setSearchResults([])
													}}
													className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
												>
													<Avatar
														size="sm"
														isSquare
														src={workspace.logoUrl}
														seed={workspace.name}
													/>
													<div className="flex flex-1 flex-col">
														<span className="font-medium text-fg text-sm">
															{workspace.name}
														</span>
														{workspace.slug ? (
															<span className="text-muted-fg text-xs">
																{workspace.slug}
															</span>
														) : (
															<span className="text-danger text-xs">
																Shareable slug required
															</span>
														)}
													</div>
												</button>
											)
										})}
									</div>
								)}
							</div>
						)}

						{selectedWorkspace && (
							<div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
								<Avatar
									size="xxs"
									isSquare
									src={selectedWorkspace.logoUrl}
									seed={selectedWorkspace.name}
								/>
								<span className="font-medium text-fg text-sm">{selectedWorkspace.name}</span>
								<button
									type="button"
									onClick={() => setSelectedWorkspace(null)}
									className="ml-auto text-muted-fg hover:text-fg"
								>
									<IconClose className="size-4" />
								</button>
							</div>
						)}
					</div>

					{/* Permissions */}
					<div className="rounded-lg border border-border px-4 py-3">
						<Switch isSelected={allowGuestMemberAdds} onChange={setAllowGuestMemberAdds}>
							<div className="flex flex-col gap-0.5">
								<SwitchLabel className="font-medium text-fg text-sm">
									Allow guests to add members
								</SwitchLabel>
								<span className="text-muted-fg text-xs">
									Guests can invite their own team members to this shared channel.
								</span>
							</div>
						</Switch>
					</div>
				</ModalBody>

				<ModalFooter>
					<Button intent="outline" onPress={() => onOpenChange(false)} type="button">
						Cancel
					</Button>
					<Button intent="primary" onPress={handleSubmit} isDisabled={!canSubmit || isSubmitting}>
						{isSubmitting ? "Sending..." : "Send invite"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
