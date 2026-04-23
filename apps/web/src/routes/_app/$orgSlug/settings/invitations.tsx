import { useOrganization } from "@clerk/react"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import IconClose from "~/components/icons/icon-close"
import IconDots from "~/components/icons/icon-dots"
import IconPlus from "~/components/icons/icon-plus"
import IconUsersPlus from "~/components/icons/icon-users-plus"
import { EmailInviteModal } from "~/components/modals/email-invite-modal"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardHeaderGroup } from "~/components/ui/card"
import { EmptyState } from "~/components/ui/empty-state"
import { Loader } from "~/components/ui/loader"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "~/components/ui/menu"

export const Route = createFileRoute("/_app/$orgSlug/settings/invitations")({
	component: InvitationsSettings,
})

type ClerkInvitation = {
	readonly id: string
	readonly emailAddress: string
	readonly role: string
	readonly status: string
	readonly createdAt: Date | number
	revoke: () => Promise<unknown>
}

function InvitationsSettings() {
	const { organization, isLoaded, invitations } = useOrganization({
		invitations: { infinite: true, keepPreviousData: true, status: ["pending"] },
	})
	const [showInviteModal, setShowInviteModal] = useState(false)
	const [revokingId, setRevokingId] = useState<string | null>(null)

	const pendingInvitations = (invitations?.data ?? []) as unknown as ClerkInvitation[]

	const handleRevokeInvitation = useCallback(async (invitation: ClerkInvitation) => {
		setRevokingId(invitation.id)
		try {
			await invitation.revoke()
			toast.success("Invitation revoked successfully")
		} catch (error) {
			console.error(error)
			toast.error("Failed to revoke invitation")
		} finally {
			setRevokingId(null)
		}
	}, [])

	// Clerk's infinite query doesn't auto-refetch after a mutation; nudge it.
	useEffect(() => {
		if (!revokingId && invitations) invitations.revalidate?.()
	}, [revokingId, invitations])

	const formatSent = (createdAt: Date | number) => {
		const d = typeof createdAt === "number" ? new Date(createdAt) : createdAt
		return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
	}

	const roleLabel = (role: string) =>
		role === "org:admin" || role === "admin"
			? "Admin"
			: role === "org:member" || role === "member"
				? "Member"
				: role

	if (!isLoaded) {
		return (
			<div className="flex flex-col gap-6 px-4 lg:px-8">
				<Loader />
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-col gap-6 px-4 lg:px-8">
				<Card>
					<CardHeader>
						<CardHeaderGroup>
							<div className="flex flex-1 flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<h2 className="font-semibold text-fg text-lg">Pending invitations</h2>
									{pendingInvitations.length > 0 && (
										<Badge intent="secondary">{pendingInvitations.length} pending</Badge>
									)}
								</div>
								<p className="text-muted-fg text-sm">
									Manage pending invitations sent to team members. Clerk handles email
									delivery and hosts the accept page.
								</p>
							</div>
							<div className="flex gap-3">
								<Button intent="secondary" size="md" onPress={() => setShowInviteModal(true)}>
									<IconPlus data-slot="icon" />
									Invite user
								</Button>
							</div>
						</CardHeaderGroup>
					</CardHeader>

					{pendingInvitations.length === 0 ? (
						<EmptyState
							icon={IconUsersPlus}
							title="No pending invitations"
							description="Invite team members to join your organization."
							action={
								<Button intent="secondary" size="sm" onPress={() => setShowInviteModal(true)}>
									<IconPlus data-slot="icon" />
									Invite a team member
								</Button>
							}
							className="h-64"
						/>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead className="border-border border-b bg-bg">
									<tr>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Email
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Role
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Status
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Sent
										</th>
										<th className="px-4 py-3 text-right font-medium text-muted-fg text-xs">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{pendingInvitations.map((invitation) => (
										<tr key={invitation.id} className="hover:bg-secondary/50">
											<td className="px-4 py-4">
												<p className="font-medium text-fg text-sm">
													{invitation.emailAddress}
												</p>
											</td>
											<td className="px-4 py-4">
												<p className="text-muted-fg text-sm">
													{roleLabel(invitation.role)}
												</p>
											</td>
											<td className="px-4 py-4">
												<Badge intent="warning">
													<span className="size-1.5 rounded-full bg-current" />
													Pending
												</Badge>
											</td>
											<td className="px-4 py-4">
												<p className="text-muted-fg text-sm">
													{formatSent(invitation.createdAt)}
												</p>
											</td>
											<td className="px-4 py-4 text-right">
												<Menu>
													<Button
														intent="plain"
														size="sq-xs"
														isPending={revokingId === invitation.id}
														isDisabled={revokingId === invitation.id}
													>
														<IconDots />
													</Button>
													<MenuContent placement="bottom end">
														<MenuItem
															onAction={() => handleRevokeInvitation(invitation)}
															intent="danger"
															isDisabled={revokingId === invitation.id}
														>
															<IconClose data-slot="icon" />
															{revokingId === invitation.id
																? "Revoking..."
																: "Revoke Invitation"}
														</MenuItem>
													</MenuContent>
												</Menu>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>
			</div>

			{organization && (
				<EmailInviteModal isOpen={showInviteModal} onOpenChange={setShowInviteModal} />
			)}
		</>
	)
}
