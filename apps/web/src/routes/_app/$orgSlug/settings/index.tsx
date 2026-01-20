import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import IconCompany from "~/components/icons/icon-company"
import IconCopy from "~/components/icons/icon-copy"
import IconEdit from "~/components/icons/icon-edit"
import IconShare from "~/components/icons/icon-share"
import IconWarning from "~/components/icons/icon-warning"
import { DeleteWorkspaceModal } from "~/components/modals/delete-workspace-modal"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { TextField } from "~/components/ui/text-field"
import { setPublicModeAction, updateOrganizationAction } from "~/db/actions"
import { organizationMemberCollection, userCollection } from "~/db/collections"
import { useOrganizationAvatarUpload } from "~/hooks/use-organization-avatar-upload"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { toastExit } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/")({
	component: GeneralSettings,
})

function GeneralSettings() {
	const { orgSlug } = useParams({ from: "/_app/$orgSlug" })
	const { organizationId, organization } = useOrganization()
	const { user, isLoading: isAuthLoading } = useAuth()
	const navigate = useNavigate()

	const [name, setName] = useState(organization?.name ?? "")
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	// Sync local state when organization name changes from server
	useEffect(() => {
		if (organization?.name) {
			setName(organization.name)
		}
	}, [organization?.name])

	const fileInputRef = useRef<HTMLInputElement>(null)

	const { uploadOrganizationAvatar, isUploading } = useOrganizationAvatarUpload(organizationId!)

	const updateOrganizationResult = useAtomValue(updateOrganizationAction)
	const setPublicModeResult = useAtomValue(setPublicModeAction)

	const updateOrganization = useAtomSet(updateOrganizationAction, {
		mode: "promiseExit",
	})

	const setPublicMode = useAtomSet(setPublicModeAction, {
		mode: "promiseExit",
	})

	// Derive loading states from Result.waiting
	const isSavingName = updateOrganizationResult.waiting
	const isTogglingPublic = setPublicModeResult.waiting

	// Get team members to check permissions
	const { data: teamMembers, isLoading: isLoadingMembers } = useLiveQuery(
		(q) =>
			q
				.from({ members: organizationMemberCollection })
				.where(({ members }) => eq(members.organizationId, organizationId))
				.innerJoin({ user: userCollection }, ({ members, user }) => eq(members.userId, user.id))
				.where(({ user }) => eq(user.userType, "user"))
				.select(({ members }) => ({ ...members })),
		[organizationId],
	)

	// Check if user is admin or owner
	const currentUserMember = teamMembers?.find((m) => m.userId === user?.id)
	const isAdmin = currentUserMember?.role === "owner" || currentUserMember?.role === "admin"
	const isOwner = currentUserMember?.role === "owner"

	// While loading, don't hide UI elements - just disable them
	const isPermissionsLoading = isAuthLoading || isLoadingMembers

	const getInitials = (orgName: string) => {
		const words = orgName.trim().split(/\s+/)
		if (words.length >= 2) {
			return `${words[0]?.charAt(0) ?? ""}${words[1]?.charAt(0) ?? ""}`.toUpperCase()
		}
		return orgName.slice(0, 2).toUpperCase()
	}

	const handleSaveName = async () => {
		if (!organizationId || !name.trim() || name === organization?.name) return

		await toastExit(
			updateOrganization({
				organizationId,
				name: name.trim(),
			}),
			{
				loading: "Updating organization name...",
				success: "Organization name updated",
				customErrors: {
					OrganizationNotFoundError: () => ({
						title: "Organization not found",
						description: "This organization may have been deleted.",
						isRetryable: false,
					}),
					OrganizationSlugAlreadyExistsError: () => ({
						title: "Slug already exists",
						description: "This organization slug is already taken.",
						isRetryable: false,
					}),
				},
			},
		)
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		await uploadOrganizationAvatar(file)

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const publicInviteUrl = orgSlug ? `${window.location.origin}/join/${orgSlug}` : ""

	const handleCopyInviteLink = async () => {
		try {
			await navigator.clipboard.writeText(publicInviteUrl)
			toast.success("Invite link copied to clipboard")
		} catch {
			toast.error("Failed to copy link")
		}
	}

	const handleTogglePublicMode = async (isPublic: boolean) => {
		if (!organizationId) return

		await toastExit(
			setPublicMode({
				organizationId,
				isPublic,
			}),
			{
				loading: isPublic ? "Enabling public invites..." : "Disabling public invites...",
				success: isPublic ? "Public invites enabled" : "Public invites disabled",
				customErrors: {
					OrganizationNotFoundError: () => ({
						title: "Organization not found",
						description: "This organization may have been deleted.",
						isRetryable: false,
					}),
				},
			},
		)
	}

	const workspaceUrl = orgSlug ? `${window.location.origin}/${orgSlug}` : ""

	const handleCopyWorkspaceUrl = async () => {
		try {
			await navigator.clipboard.writeText(workspaceUrl)
			toast.success("Workspace URL copied to clipboard")
		} catch {
			toast.error("Failed to copy URL")
		}
	}

	const handleWorkspaceDeleted = () => {
		navigate({ to: "/" })
	}

	if (!organizationId) {
		return null
	}

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			{/* Organization Profile Section */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
				<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<IconCompany className="size-5 text-muted-fg" />
							<h2 className="font-semibold text-fg text-lg">Organization Profile</h2>
						</div>
						<p className="text-muted-fg text-sm">
							Manage your organization's name and appearance.
						</p>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<div className="flex flex-col gap-6">
						{/* Avatar Upload */}
						<div className="flex flex-col gap-2">
							<Label>Organization Logo</Label>
							<div className="flex items-center gap-4">
								<button
									type="button"
									className="group relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading || isPermissionsLoading || !isAdmin}
								>
									<Avatar
										src={organization?.logoUrl}
										initials={organization?.name ? getInitials(organization.name) : "ORG"}
										size="4xl"
										placeholderIcon={IconCompany}
									/>
									{isAdmin && (
										<div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
											<IconEdit className="size-6 text-white" />
										</div>
									)}
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/png,image/webp"
									className="hidden"
									onChange={handleFileChange}
									disabled={isUploading || isPermissionsLoading || !isAdmin}
								/>
								<div className="flex flex-col gap-1">
									<p className="font-medium text-fg text-sm">
										{isUploading ? "Uploading..." : "Click to upload"}
									</p>
									<p className="text-muted-fg text-xs">JPG, PNG or WebP. Max 5MB.</p>
								</div>
							</div>
						</div>

						{/* Organization Name */}
						<TextField className="max-w-md">
							<Label>Organization Name</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={handleSaveName}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSaveName()
									}
								}}
								placeholder="Enter organization name"
								disabled={isSavingName || isPermissionsLoading || !isAdmin}
							/>
							<Description>This is the display name for your organization.</Description>
						</TextField>

						{isAdmin && name !== organization?.name && name.trim() && (
							<div className="flex items-center gap-2">
								<Button
									intent="primary"
									size="sm"
									onPress={handleSaveName}
									isDisabled={isSavingName}
								>
									{isSavingName ? "Saving..." : "Save Changes"}
								</Button>
								<Button
									intent="secondary"
									size="sm"
									onPress={() => setName(organization?.name ?? "")}
									isDisabled={isSavingName}
								>
									Cancel
								</Button>
							</div>
						)}

						{/* Workspace URL */}
						<div className="flex flex-col gap-2">
							<Label>Workspace URL</Label>
							<div className="flex items-center gap-2">
								<div className="flex-1 rounded-lg border border-border bg-bg-muted/30 px-3 py-2">
									<code className="break-all text-fg text-sm">{workspaceUrl}</code>
								</div>
								<Button intent="secondary" size="md" onPress={handleCopyWorkspaceUrl}>
									<IconCopy data-slot="icon" />
									Copy
								</Button>
							</div>
							<Description>
								This is your workspace's unique URL. Share it with your team.
							</Description>
						</div>
					</div>
				</div>
			</div>

			{/* Public Invite Link Section - Only visible to admins/owners */}
			{(isAdmin || isPermissionsLoading) && (
				<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
					<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<IconShare className="size-5 text-muted-fg" />
								<h2 className="font-semibold text-fg text-lg">Public Invite Link</h2>
							</div>
							<p className="text-muted-fg text-sm">
								Allow anyone with the link to join your workspace.
							</p>
						</div>
					</div>

					<div className="p-4 md:p-6">
						<div className="flex flex-col gap-4">
							<Switch
								isSelected={organization?.isPublic ?? false}
								onChange={handleTogglePublicMode}
								isDisabled={isTogglingPublic || isPermissionsLoading || !isAdmin}
							>
								<SwitchLabel>Enable public invite link</SwitchLabel>
							</Switch>

							{organization?.isPublic && (
								<div className="flex flex-col gap-2">
									<p className="text-muted-fg text-sm">
										Anyone with this link can join your workspace as a member.
									</p>
									<div className="flex items-center gap-2">
										<div className="flex-1 rounded-lg border border-border bg-bg-muted/30 px-3 py-2">
											<code className="break-all text-fg text-sm">
												{publicInviteUrl}
											</code>
										</div>
										<Button intent="secondary" size="md" onPress={handleCopyInviteLink}>
											<IconCopy data-slot="icon" />
											Copy
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Danger Zone - Only visible to owners */}
			{(isOwner || isPermissionsLoading) && (
				<div className="overflow-hidden rounded-xl border border-danger/20 bg-danger/5 shadow-sm">
					<div className="border-danger/20 border-b bg-danger/5 px-4 py-5 md:px-6">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<IconWarning className="size-5 text-danger" />
								<h2 className="font-semibold text-danger text-lg">Danger Zone</h2>
							</div>
							<p className="text-muted-fg text-sm">
								Irreversible and destructive actions for this workspace.
							</p>
						</div>
					</div>

					<div className="p-4 md:p-6">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-col gap-1">
								<p className="font-medium text-fg text-sm">Delete this workspace</p>
								<p className="text-muted-fg text-sm">
									Once deleted, all data including channels, messages, and members will be
									permanently removed.
								</p>
							</div>
							<Button
								intent="danger"
								size="md"
								onPress={() => setShowDeleteModal(true)}
								isDisabled={isPermissionsLoading || !isOwner}
							>
								Delete workspace
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Workspace Modal */}
			{organization && (
				<DeleteWorkspaceModal
					organizationId={organizationId}
					organizationName={organization.name}
					isOpen={showDeleteModal}
					onOpenChange={setShowDeleteModal}
					onDeleted={handleWorkspaceDeleted}
				/>
			)}
		</div>
	)
}
