import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId } from "@hazel/schema"
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
}

interface WorkspaceResult {
	id: string
	name: string
	slug: string | null
	logoUrl: string | null
}

type TargetKind = "slug" | "email"

export function ShareChannelModal({ isOpen, onOpenChange, channelId, channelName }: ShareChannelModalProps) {
	const [targetKind, setTargetKind] = useState<TargetKind>("slug")
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<WorkspaceResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceResult | null>(null)
	const [email, setEmail] = useState("")
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
					const exit = await searchWorkspaces({ payload: { query } })
					if (exit._tag === "Success") {
						setSearchResults(
							exit.value.data.map((r) => ({
								id: r.id,
								name: r.name,
								slug: r.slug,
								logoUrl: r.logoUrl,
							})),
						)
					}
				} finally {
					setIsSearching(false)
				}
			}, 300)
		},
		[searchWorkspaces],
	)

	const handleSubmit = async () => {
		const targetValue = targetKind === "slug" ? (selectedWorkspace?.slug ?? "") : email
		if (!targetValue) return

		setIsSubmitting(true)
		try {
			await exitToastAsync(
				createInvite({
					payload: {
						channelId,
						target: { kind: targetKind, value: targetValue },
						allowGuestMemberAdds,
					},
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
		} finally {
			setIsSubmitting(false)
		}
	}

	const resetState = () => {
		setTargetKind("slug")
		setSearchQuery("")
		setSearchResults([])
		setSelectedWorkspace(null)
		setEmail("")
		setAllowGuestMemberAdds(false)
	}

	const canSubmit = targetKind === "slug" ? !!selectedWorkspace : email.length > 0 && email.includes("@")

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
					{/* Target type selector */}
					<div className="flex gap-0.5 rounded-lg bg-secondary p-0.5">
						<button
							type="button"
							onClick={() => {
								setTargetKind("slug")
								setEmail("")
							}}
							className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-colors duration-150 ${
								targetKind === "slug"
									? "bg-bg text-fg shadow-sm"
									: "text-muted-fg hover:text-fg"
							}`}
						>
							Search workspace
						</button>
						<button
							type="button"
							onClick={() => {
								setTargetKind("email")
								setSearchQuery("")
								setSearchResults([])
								setSelectedWorkspace(null)
							}}
							className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-colors duration-150 ${
								targetKind === "email"
									? "bg-bg text-fg shadow-sm"
									: "text-muted-fg hover:text-fg"
							}`}
						>
							Invite by email
						</button>
					</div>

					{/* Workspace search */}
					{targetKind === "slug" && (
						<div className="flex flex-col gap-2">
							<TextField>
								<Label>Workspace</Label>
								<Input
									placeholder="Search by name or slug..."
									value={selectedWorkspace ? selectedWorkspace.name : searchQuery}
									onChange={(e) => {
										if (selectedWorkspace) {
											setSelectedWorkspace(null)
										}
										handleSearch(e.target.value)
									}}
								/>
							</TextField>

							{/* Search results */}
							{!selectedWorkspace && searchQuery.length >= 2 && (
								<div className="rounded-lg border border-border bg-bg">
									{isSearching ? (
										<div className="flex items-center justify-center py-6">
											<Loader />
										</div>
									) : searchResults.length === 0 ? (
										<div className="px-4 py-6 text-center text-muted-fg text-sm">
											No workspaces found
										</div>
									) : (
										<div className="divide-y divide-border">
											{searchResults.map((workspace) => (
												<button
													key={workspace.id}
													type="button"
													onClick={() => {
														setSelectedWorkspace(workspace)
														setSearchQuery("")
														setSearchResults([])
													}}
													className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-secondary/50"
												>
													<Avatar
														size="sm"
														isSquare
														src={workspace.logoUrl}
														seed={workspace.name}
													/>
													<div className="flex flex-col">
														<span className="font-medium text-fg text-sm">
															{workspace.name}
														</span>
														{workspace.slug && (
															<span className="text-muted-fg text-xs">
																{workspace.slug}
															</span>
														)}
													</div>
												</button>
											))}
										</div>
									)}
								</div>
							)}

							{/* Selected workspace pill */}
							{selectedWorkspace && (
								<div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
									<Avatar
										size="xxs"
										isSquare
										src={selectedWorkspace.logoUrl}
										seed={selectedWorkspace.name}
									/>
									<span className="font-medium text-fg text-sm">
										{selectedWorkspace.name}
									</span>
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
					)}

					{/* Email input */}
					{targetKind === "email" && (
						<TextField>
							<Label>Email address</Label>
							<Input
								type="email"
								placeholder="team@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</TextField>
					)}

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
