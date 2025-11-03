import { useAtomSet } from "@effect-atom/atom-react"
import type { InvitationId } from "@hazel/db/schema"
import { ArrowPathIcon } from "@heroicons/react/20/solid"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { resendInvitationMutation, revokeInvitationMutation } from "~/atoms/invitation-atoms"
import IconClose from "~/components/icons/icon-close"
import IconPlus from "~/components/icons/icon-plus"
import { EmailInviteModal } from "~/components/modals/email-invite-modal"
import { Button } from "~/components/ui/button"
import { invitationCollection, userCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { toastExit } from "~/lib/toast-exit"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/_app/$orgSlug/settings/invitations")({
	component: InvitationsSettings,
})

function InvitationsSettings() {
	const [showInviteModal, setShowInviteModal] = useState(false)

	const { organizationId } = useOrganization()

	const resendInvitation = useAtomSet(resendInvitationMutation, {
		mode: "promiseExit",
	})

	const revokeInvitation = useAtomSet(revokeInvitationMutation, {
		mode: "promiseExit",
	})

	const { data: invitations } = useLiveQuery(
		(q) =>
			q
				.from({
					invitation: invitationCollection,
				})
				.leftJoin(
					{
						invitee: userCollection,
					},
					({ invitation, invitee }) => eq(invitation.invitedBy, invitee.id),
				)
				.where(({ invitation }) => eq(invitation.organizationId, organizationId))
				.select(({ invitation, invitee }) => ({
					...invitation,
					invitee,
				})),
		[organizationId],
	)

	const pendingInvitations = invitations?.filter((inv) => inv.status === "pending") || []

	const formatTimeRemaining = (milliseconds: number) => {
		if (milliseconds <= 0) return "Expired"

		const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
		const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

		if (days > 0) {
			return `Expires in ${days} day${days > 1 ? "s" : ""}`
		}
		if (hours > 0) {
			return `Expires in ${hours} hour${hours > 1 ? "s" : ""}`
		}
		return "Expires soon"
	}

	const handleResendInvitation = async (invitationId: InvitationId) => {
		await toastExit(
			resendInvitation({
				payload: {
					invitationId,
				},
			}),
			{
				loading: "Resending invitation...",
				success: "Invitation resent successfully",
				error: "Failed to resend invitation",
			},
		)
	}

	const handleRevokeInvitation = async (invitationId: InvitationId) => {
		await toastExit(
			revokeInvitation({
				payload: {
					invitationId,
				},
			}),
			{
				loading: "Revoking invitation...",
				success: "Invitation revoked successfully",
				error: "Failed to revoke invitation",
			},
		)
	}

	return (
		<>
			<div className="flex flex-col gap-6 px-4 lg:px-8">
				<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
					<div className="border-border border-b bg-bg px-4 py-5 md:px-6">
						<div className="flex flex-col items-start gap-4 md:flex-row">
							<div className="flex flex-1 flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<h2 className="font-semibold text-fg text-lg">Pending invitations</h2>
									{pendingInvitations.length > 0 && (
										<span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-xs">
											{pendingInvitations.length} pending
										</span>
									)}
								</div>
								<p className="text-muted-fg text-sm">
									Manage pending invitations sent to team members.
								</p>
							</div>
							<div className="flex gap-3">
								<Button intent="secondary" size="md" onPress={() => setShowInviteModal(true)}>
									<IconPlus data-slot="icon" />
									Invite user
								</Button>
							</div>
						</div>
					</div>

					{pendingInvitations.length === 0 ? (
						<div className="flex h-64 items-center justify-center">
							<p className="text-muted-fg text-sm">No pending invitations</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead className="border-border border-b bg-bg">
									<tr>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Email
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Invited by
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Status
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Expiration
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{pendingInvitations.map((invitation) => (
										<tr key={invitation.id} className="hover:bg-secondary/50">
											<td className="px-4 py-4">
												<p className="font-medium text-fg text-sm">
													{invitation.email}
												</p>
											</td>
											<td className="px-4 py-4">
												<p className="text-muted-fg text-sm">
													{invitation.invitee
														? `${invitation.invitee.firstName} ${invitation.invitee.lastName}`
														: "System"}
												</p>
											</td>
											<td className="px-4 py-4">
												<span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs">
													<span className="size-1.5 rounded-full bg-current" />
													Pending
												</span>
											</td>
											<td className="px-4 py-4">
												<p className="text-muted-fg text-sm">
													{formatTimeRemaining(
														invitation.expiresAt.getTime() - Date.now(),
													)}
												</p>
											</td>
											<td className="px-4 py-4">
												<div className="flex items-center justify-end gap-1">
													<Button
														intent="plain"
														size="sq-xs"
														onPress={() => handleResendInvitation(invitation.id)}
														aria-label="Resend invitation"
													>
														<ArrowPathIcon data-slot="icon" />
													</Button>
													<Button
														intent="plain"
														size="sq-xs"
														onPress={() => handleRevokeInvitation(invitation.id)}
														aria-label="Revoke invitation"
													>
														<IconClose data-slot="icon" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Email Invite Modal */}
			{organizationId && (
				<EmailInviteModal
					isOpen={showInviteModal}
					onOpenChange={setShowInviteModal}
					organizationId={organizationId}
				/>
			)}
		</>
	)
}
