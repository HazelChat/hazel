import { useAtomSet } from "@effect-atom/atom-react"
import type { ConnectInviteId, OrganizationId } from "@hazel/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { acceptConnectInviteMutation, declineConnectInviteMutation } from "~/atoms/connect-share-atoms"
import { IconConnect } from "~/components/icons/icon-connect"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { connectInviteCollection, organizationCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { exitToastAsync } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/connect-invites")({
	component: ConnectInvitesPage,
})

function ConnectInvitesPage() {
	const { organizationId, organization } = useOrganization()

	// Get incoming invites - where this org is the target
	// Match by slug (targetKind=slug, targetValue=orgSlug) or by guestOrganizationId
	const { data: incomingInvites } = useLiveQuery(
		(q) =>
			q
				.from({ invite: connectInviteCollection })
				.where(({ invite }) =>
					// Show invites that target this org (either by guestOrganizationId or by slug)
					eq(invite.guestOrganizationId, organizationId),
				)
				.select(({ invite }) => ({ ...invite })),
		[organizationId],
	)

	// Also check for slug-based invites targeting this org
	const { data: slugInvites } = useLiveQuery(
		(q) =>
			q
				.from({ invite: connectInviteCollection })
				.where(({ invite }) => eq(invite.targetKind, "slug"))
				.where(({ invite }) => eq(invite.targetValue, organization?.slug ?? ""))
				.select(({ invite }) => ({ ...invite })),
		[organization?.slug],
	)

	// Merge and deduplicate
	const allInvites = (() => {
		const map = new Map<string, typeof incomingInvites extends Array<infer T> ? T : never>()
		for (const inv of incomingInvites ?? []) map.set(inv.id, inv)
		for (const inv of slugInvites ?? []) map.set(inv.id, inv)
		return Array.from(map.values())
	})()

	const pendingInvites = allInvites.filter((inv) => inv.status === "pending")
	const otherInvites = allInvites.filter((inv) => inv.status !== "pending")

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			{/* Pending invites */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
				<div className="border-border border-b bg-bg px-4 py-5 md:px-6">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-fg text-lg">Connect invitations</h2>
							{pendingInvites.length > 0 && (
								<span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-xs">
									{pendingInvites.length} pending
								</span>
							)}
						</div>
						<p className="text-muted-fg text-sm">
							Invitations from other organizations to share channels.
						</p>
					</div>
				</div>

				{pendingInvites.length === 0 && otherInvites.length === 0 ? (
					<EmptyState
						icon={IconConnect}
						title="No connect invitations"
						description="When another organization invites you to share a channel, it will appear here."
						className="h-64"
					/>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-full">
							<thead className="border-border border-b bg-bg">
								<tr>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										From
									</th>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										Status
									</th>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										Received
									</th>
									<th className="px-4 py-3 text-right font-medium text-muted-fg text-xs">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{pendingInvites.map((invite) => (
									<IncomingInviteRow
										key={invite.id}
										invite={invite}
										organizationId={organizationId}
									/>
								))}
								{otherInvites.map((invite) => (
									<IncomingInviteRow
										key={invite.id}
										invite={invite}
										organizationId={organizationId}
									/>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}

function IncomingInviteRow({
	invite,
	organizationId,
}: {
	invite: {
		id: string
		hostOrganizationId: string
		status: string
		createdAt: Date
	}
	organizationId: OrganizationId | undefined
}) {
	const [isAccepting, setIsAccepting] = useState(false)
	const [isDeclining, setIsDeclining] = useState(false)

	const acceptInvite = useAtomSet(acceptConnectInviteMutation, { mode: "promiseExit" })
	const declineInvite = useAtomSet(declineConnectInviteMutation, { mode: "promiseExit" })

	// Resolve host organization name
	const { data: hostOrg } = useLiveQuery(
		(q) =>
			q
				.from({ org: organizationCollection })
				.where(({ org }) => eq(org.id, invite.hostOrganizationId as OrganizationId))
				.findOne()
				.select(({ org }) => ({ name: org.name, slug: org.slug, logoUrl: org.logoUrl })),
		[invite.hostOrganizationId],
	)

	const statusBadge = {
		pending: { intent: "warning" as const, label: "Pending" },
		accepted: { intent: "success" as const, label: "Accepted" },
		declined: { intent: "secondary" as const, label: "Declined" },
		revoked: { intent: "secondary" as const, label: "Revoked" },
		expired: { intent: "secondary" as const, label: "Expired" },
	}[invite.status] ?? { intent: "secondary" as const, label: invite.status }

	const handleAccept = async () => {
		if (!organizationId) return
		setIsAccepting(true)
		try {
			await exitToastAsync(
				acceptInvite({
					payload: {
						inviteId: invite.id as ConnectInviteId,
						guestOrganizationId: organizationId,
					},
				}),
			)
				.loading("Accepting invite...")
				.successMessage("Channel connected")
				.onErrorTag("ConnectInviteNotFoundError", () => ({
					title: "Invite not found",
					description: "This invite may have been revoked or expired.",
					isRetryable: false,
				}))
				.onErrorTag("ConnectInviteInvalidStateError", () => ({
					title: "Cannot accept",
					description: "This invite is no longer in an acceptable state.",
					isRetryable: false,
				}))
				.onErrorTag("ConnectWorkspaceNotFoundError", () => ({
					title: "Workspace not found",
					description: "The target workspace could not be found.",
					isRetryable: false,
				}))
				.run()
		} finally {
			setIsAccepting(false)
		}
	}

	const handleDecline = async () => {
		setIsDeclining(true)
		try {
			await exitToastAsync(
				declineInvite({
					payload: {
						inviteId: invite.id as ConnectInviteId,
					},
				}),
			)
				.loading("Declining invite...")
				.successMessage("Invite declined")
				.onErrorTag("ConnectInviteNotFoundError", () => ({
					title: "Invite not found",
					description: "This invite may have already been revoked or expired.",
					isRetryable: false,
				}))
				.onErrorTag("ConnectInviteInvalidStateError", () => ({
					title: "Cannot decline",
					description: "This invite is no longer in a declinable state.",
					isRetryable: false,
				}))
				.run()
		} finally {
			setIsDeclining(false)
		}
	}

	const isBusy = isAccepting || isDeclining

	return (
		<tr className="hover:bg-secondary/50">
			<td className="px-4 py-4">
				<span className="font-medium text-fg text-sm">
					{hostOrg?.name ?? invite.hostOrganizationId}
				</span>
			</td>
			<td className="px-4 py-4">
				<Badge intent={statusBadge.intent} size="sm">
					{statusBadge.label}
				</Badge>
			</td>
			<td className="px-4 py-4">
				<span className="text-muted-fg text-sm">{invite.createdAt.toLocaleDateString()}</span>
			</td>
			<td className="px-4 py-4 text-right">
				{invite.status === "pending" && (
					<div className="flex items-center justify-end gap-2">
						<Button intent="outline" size="sm" onPress={handleDecline} isDisabled={isBusy}>
							{isDeclining ? "Declining..." : "Decline"}
						</Button>
						<Button intent="primary" size="sm" onPress={handleAccept} isDisabled={isBusy}>
							{isAccepting ? "Accepting..." : "Accept"}
						</Button>
					</div>
				)}
			</td>
		</tr>
	)
}
