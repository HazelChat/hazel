import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { getAdminPortalLinkMutation } from "~/atoms/organization-atoms"
import IconLinkExternal from "~/components/icons/icon-link-external"
import IconLock from "~/components/icons/icon-lock"
import { Button } from "~/components/ui/button"
import { organizationMemberCollection, userCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { exitToastAsync } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/authentication")({
	component: AuthenticationSettings,
})

function AuthenticationSettings() {
	const { organizationId } = useOrganization()
	const { user, isLoading: isAuthLoading } = useAuth()

	const [loadingIntent, setLoadingIntent] = useState<string | null>(null)

	const getAdminPortalLinkResult = useAtomValue(getAdminPortalLinkMutation)
	const getAdminPortalLink = useAtomSet(getAdminPortalLinkMutation, {
		mode: "promiseExit",
	})

	const isLoadingPortalLink = getAdminPortalLinkResult.waiting

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

	// While loading, don't hide UI elements - just disable them
	const isPermissionsLoading = isAuthLoading || isLoadingMembers

	const handleOpenPortal = async (intent: "sso" | "domain_verification") => {
		if (!organizationId) return

		setLoadingIntent(intent)

		await exitToastAsync(
			getAdminPortalLink({
				payload: { id: organizationId, intent },
			}),
		)
			.loading("Opening admin portal...")
			.onSuccess((result) => {
				window.open(result.link, "_blank")
			})
			.onErrorTag("OrganizationNotFoundError", () => ({
				title: "Organization not found",
				description: "This organization may have been deleted.",
				isRetryable: false,
			}))
			.run()

		setLoadingIntent(null)
	}

	if (!organizationId) {
		return null
	}

	// Show access denied for non-admins
	if (!isPermissionsLoading && !isAdmin) {
		return (
			<div className="flex flex-col gap-6 px-4 lg:px-8">
				<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
					<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<IconLock className="size-5 text-muted-fg" />
								<h2 className="font-semibold text-fg text-lg">Authentication</h2>
							</div>
							<p className="text-muted-fg text-sm">
								Configure SSO and domain verification for your organization.
							</p>
						</div>
					</div>
					<div className="p-4 md:p-6">
						<p className="text-muted-fg text-sm">
							You don't have permission to access authentication settings. Please contact an
							admin or owner.
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			{/* SSO Section */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
				<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<IconLock className="size-5 text-muted-fg" />
							<h2 className="font-semibold text-fg text-lg">Single Sign-On (SSO)</h2>
						</div>
						<p className="text-muted-fg text-sm">
							Configure SAML or OIDC-based single sign-on for your organization.
						</p>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-1">
							<p className="font-medium text-fg text-sm">SSO Configuration</p>
							<p className="text-muted-fg text-sm">
								Set up identity provider connections for seamless authentication.
							</p>
						</div>
						<Button
							intent="secondary"
							size="md"
							onPress={() => handleOpenPortal("sso")}
							isDisabled={isLoadingPortalLink || isPermissionsLoading}
						>
							<IconLinkExternal data-slot="icon" />
							{loadingIntent === "sso" ? "Opening..." : "Configure SSO"}
						</Button>
					</div>
				</div>
			</div>

			{/* Domain Verification Section */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
				<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<IconLock className="size-5 text-muted-fg" />
							<h2 className="font-semibold text-fg text-lg">Domain Verification</h2>
						</div>
						<p className="text-muted-fg text-sm">
							Verify ownership of your organization's email domains.
						</p>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-1">
							<p className="font-medium text-fg text-sm">Verified Domains</p>
							<p className="text-muted-fg text-sm">
								Add and verify domains to enable automatic user provisioning and SSO.
							</p>
						</div>
						<Button
							intent="secondary"
							size="md"
							onPress={() => handleOpenPortal("domain_verification")}
							isDisabled={isLoadingPortalLink || isPermissionsLoading}
						>
							<IconLinkExternal data-slot="icon" />
							{loadingIntent === "domain_verification" ? "Opening..." : "Manage Domains"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
