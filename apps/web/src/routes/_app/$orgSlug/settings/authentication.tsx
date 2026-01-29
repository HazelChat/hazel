import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import {
	addOrganizationDomainMutation,
	getAdminPortalLinkMutation,
	listOrganizationDomainsQuery,
	removeOrganizationDomainMutation,
} from "~/atoms/organization-atoms"
import IconCheck from "~/components/icons/icon-check"
import IconCopy from "~/components/icons/icon-copy"
import IconLinkExternal from "~/components/icons/icon-link-external"
import IconLock from "~/components/icons/icon-lock"
import IconPlus from "~/components/icons/icon-plus"
import IconTrash from "~/components/icons/icon-trash"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Loader } from "~/components/ui/loader"
import { TextField } from "~/components/ui/text-field"
import { organizationMemberCollection, userCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { exitToastAsync } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/authentication")({
	component: AuthenticationSettings,
})

type DomainState = "pending" | "verified" | "failed" | "legacy_verified"

interface Domain {
	id: string
	domain: string
	state: DomainState
	verificationToken: string | null
}

function DomainStatusBadge({ state }: { state: DomainState }) {
	switch (state) {
		case "verified":
		case "legacy_verified":
			return <Badge intent="success">Verified</Badge>
		case "pending":
			return (
				<Badge intent="warning" className="gap-1.5">
					<Loader className="size-3" />
					Pending
				</Badge>
			)
		case "failed":
			return <Badge intent="danger">Failed</Badge>
		default:
			return <Badge intent="secondary">{state}</Badge>
	}
}

function DomainRow({
	domain,
	onRemove,
	isRemoving,
}: {
	domain: Domain
	onRemove: (domainId: string) => void
	isRemoving: boolean
}) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (domain.verificationToken) {
			await navigator.clipboard.writeText(`workos-verify=${domain.verificationToken}`)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	const isPending = domain.state === "pending"

	return (
		<div className="rounded-lg border border-border bg-bg-muted/20 p-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="font-medium text-fg">{domain.domain}</span>
					<DomainStatusBadge state={domain.state} />
				</div>
				<Button
					intent="outline"
					size="sm"
					onPress={() => onRemove(domain.id)}
					isDisabled={isRemoving}
				>
					{isRemoving ? <Loader className="size-4" /> : <IconTrash data-slot="icon" />}
					Remove
				</Button>
			</div>

			{isPending && domain.verificationToken && (
				<div className="mt-4 space-y-3">
					<p className="text-muted-fg text-sm">
						Add a TXT record to your DNS settings to verify ownership:
					</p>
					<div className="grid gap-3 sm:grid-cols-[auto_auto_1fr]">
						<div className="space-y-1">
							<p className="font-medium text-fg text-xs">Type</p>
							<div className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm">
								TXT
							</div>
						</div>
						<div className="space-y-1">
							<p className="font-medium text-fg text-xs">Name</p>
							<div className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm">
								@
							</div>
						</div>
						<div className="space-y-1">
							<p className="font-medium text-fg text-xs">Content</p>
							<div className="flex items-center gap-2">
								<div className="flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm">
									workos-verify={domain.verificationToken}
								</div>
								<Button intent="outline" size="sm" onPress={handleCopy}>
									{copied ? (
										<IconCheck data-slot="icon" className="text-success" />
									) : (
										<IconCopy data-slot="icon" />
									)}
									{copied ? "Copied" : "Copy"}
								</Button>
							</div>
						</div>
					</div>
					<p className="text-muted-fg text-xs">
						DNS changes can take up to 48 hours to propagate. The domain will be automatically
						verified once the record is detected.
					</p>
				</div>
			)}
		</div>
	)
}

function AddDomainForm({ onAdd, isAdding }: { onAdd: (domain: string) => void; isAdding: boolean }) {
	const [domain, setDomain] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (domain.trim()) {
			onAdd(domain.trim())
			setDomain("")
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-end gap-3">
			<TextField className="flex-1">
				<Input
					placeholder="example.com"
					value={domain}
					onChange={(e) => setDomain(e.target.value)}
					disabled={isAdding}
				/>
			</TextField>
			<Button type="submit" intent="secondary" size="md" isDisabled={isAdding || !domain.trim()}>
				{isAdding ? <Loader className="size-4" /> : <IconPlus data-slot="icon" />}
				Add Domain
			</Button>
		</form>
	)
}

function DomainManagement({
	organizationId,
	isPermissionsLoading,
}: {
	organizationId: OrganizationId
	isPermissionsLoading: boolean
}) {
	const [removingDomainId, setRemovingDomainId] = useState<string | null>(null)

	// Query for domains
	const domainsResult = useAtomValue(listOrganizationDomainsQuery(organizationId))

	// Mutations
	const addDomainResult = useAtomValue(addOrganizationDomainMutation)
	const addDomain = useAtomSet(addOrganizationDomainMutation, { mode: "promiseExit" })

	const removeDomainResult = useAtomValue(removeOrganizationDomainMutation)
	const removeDomain = useAtomSet(removeOrganizationDomainMutation, { mode: "promiseExit" })

	const isAddingDomain = addDomainResult.waiting
	const isRemovingDomain = removeDomainResult.waiting

	const domains: Domain[] = Result.getOrElse(domainsResult, () => []) as Domain[]
	// Only show loading on initial load, not during background refreshes (polling)
	const isLoadingDomains = domainsResult._tag === "Initial"

	const reactivityKeys = [`organizationDomains:${organizationId}`] as const

	const handleAddDomain = async (domain: string) => {
		await exitToastAsync(
			addDomain({
				payload: { id: organizationId, domain },
				reactivityKeys,
			}),
		)
			.loading("Adding domain...")
			.onSuccess(() => ({
				title: "Domain added",
				description: "Verify ownership by adding the DNS TXT record.",
			}))
			.onErrorTag("OrganizationNotFoundError", () => ({
				title: "Organization not found",
				description: "This organization may have been deleted.",
				isRetryable: false,
			}))
			.run()
	}

	const handleRemoveDomain = async (domainId: string) => {
		setRemovingDomainId(domainId)
		await exitToastAsync(
			removeDomain({
				payload: { id: organizationId, domainId },
				reactivityKeys,
			}),
		)
			.loading("Removing domain...")
			.onSuccess(() => ({
				title: "Domain removed",
				description: "The domain has been removed from your organization.",
			}))
			.onErrorTag("OrganizationNotFoundError", () => ({
				title: "Organization not found",
				description: "This organization may have been deleted.",
				isRetryable: false,
			}))
			.run()
		setRemovingDomainId(null)
	}

	return (
		<div className="space-y-4">
			{/* Domain list */}
			{isLoadingDomains ? (
				<div className="flex items-center justify-center py-8">
					<Loader className="size-6" />
				</div>
			) : domains.length > 0 ? (
				<div className="space-y-3">
					<p className="font-medium text-fg text-sm">Your Domains</p>
					{domains.map((domain) => (
						<DomainRow
							key={domain.id}
							domain={domain}
							onRemove={handleRemoveDomain}
							isRemoving={isRemovingDomain && removingDomainId === domain.id}
						/>
					))}
				</div>
			) : (
				<p className="py-4 text-center text-muted-fg text-sm">
					No domains configured. Add a domain to enable JIT provisioning.
				</p>
			)}

			{/* Add domain form */}
			<div className="border-border border-t pt-4">
				<p className="mb-3 font-medium text-fg text-sm">Add a Domain</p>
				<AddDomainForm onAdd={handleAddDomain} isAdding={isAddingDomain} />
			</div>
		</div>
	)
}

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
			{/* Domain Verification Section */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
				<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<IconLock className="size-5 text-muted-fg" />
							<h2 className="font-semibold text-fg text-lg">Domain Verification</h2>
						</div>
						<p className="text-muted-fg text-sm">
							Verify ownership of your email domains. When verified, users with matching emails
							are automatically added to your organization when they sign in via SSO (JIT
							provisioning).
						</p>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<DomainManagement
						organizationId={organizationId}
						isPermissionsLoading={isPermissionsLoading}
					/>
				</div>
			</div>

			{/* SSO Section - Greyed out */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg opacity-50 shadow-sm">
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
		</div>
	)
}
