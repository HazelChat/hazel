import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { getOrgBySlugPublicQuery, joinViaPublicInviteMutation } from "~/atoms/organization-atoms"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"
import { useAuth } from "~/lib/auth"
import { toastExit } from "~/lib/toast-exit"

export const Route = createFileRoute("/join/$slug")({
	component: JoinPage,
})

function JoinPage() {
	const { slug } = Route.useParams()
	const navigate = useNavigate()
	const { user, login, isLoading: authLoading } = useAuth()
	const [isJoining, setIsJoining] = useState(false)

	const orgResult = useAtomValue(getOrgBySlugPublicQuery(slug))
	const joinOrg = useAtomSet(joinViaPublicInviteMutation, { mode: "promiseExit" })

	const isLoading = orgResult._tag === "Initial" || orgResult.waiting

	const handleSignIn = () => {
		login({
			returnTo: `/join/${slug}`,
		})
	}

	const handleJoin = async () => {
		setIsJoining(true)
		try {
			const result = await toastExit(
				joinOrg({
					payload: { slug },
				}),
				{
					loading: "Joining workspace...",
					success: () => "Successfully joined workspace!",
					customErrors: {
						OrganizationNotFoundError: () => ({
							title: "Organization not found",
							description: "This organization may have been deleted.",
							isRetryable: false,
						}),
						PublicInviteDisabledError: () => ({
							title: "Public invites disabled",
							description: "This organization has disabled public invites.",
							isRetryable: false,
						}),
						AlreadyMemberError: () => ({
							title: "Already a member",
							description: "You're already a member of this workspace.",
							isRetryable: false,
						}),
					},
				},
			)

			if (result._tag === "Success") {
				// Redirect to the organization
				navigate({
					to: "/$orgSlug",
					params: { orgSlug: slug },
				})
			}
		} catch (error: any) {
			if (error?._tag === "AlreadyMemberError") {
				toast.info("You're already a member of this workspace")
				navigate({
					to: "/$orgSlug",
					params: { orgSlug: slug },
				})
			}
		} finally {
			setIsJoining(false)
		}
	}

	// Loading state
	if (isLoading || authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg">
				<Loader className="size-8" />
			</div>
		)
	}

	const org = Result.getOrElse(orgResult, () => null)

	// Organization not found or not public
	if (!org) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg px-4">
				<div className="w-full max-w-md rounded-xl border border-border bg-bg p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger/10">
						<svg
							className="size-8 text-danger"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h1 className="mb-2 font-semibold text-fg text-xl">Workspace Not Found</h1>
					<p className="mb-6 text-muted-fg">
						This invite link is invalid or the workspace doesn't have public invites enabled.
					</p>
					<Link to="/">
						<Button intent="secondary">Go to Home</Button>
					</Link>
				</div>
			</div>
		)
	}

	// Get initials for avatar fallback
	const getInitials = (name: string) => {
		const words = name.split(" ")
		if (words.length >= 2) {
			return `${words[0]?.charAt(0)}${words[1]?.charAt(0)}`.toUpperCase()
		}
		return name.substring(0, 2).toUpperCase()
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-bg px-4">
			<div className="w-full max-w-md rounded-xl border border-border bg-bg p-8 shadow-sm">
				<div className="flex flex-col items-center text-center">
					{/* Organization Avatar */}
					<Avatar
						src={org.logoUrl}
						initials={getInitials(org.name)}
						className="mb-4 size-20 text-2xl"
					/>

					{/* Organization Info */}
					<h1 className="mb-1 font-semibold text-fg text-2xl">{org.name}</h1>
					<p className="mb-6 text-muted-fg">
						{org.memberCount} {org.memberCount === 1 ? "member" : "members"}
					</p>

					{/* Divider */}
					<div className="mb-6 h-px w-full bg-border" />

					{/* Action Area */}
					{!user ? (
						<div className="w-full">
							<p className="mb-4 text-muted-fg text-sm">Sign in to join this workspace</p>
							<Button intent="primary" className="w-full" onPress={handleSignIn}>
								Sign in to Join
							</Button>
						</div>
					) : (
						<div className="w-full">
							<p className="mb-4 text-muted-fg text-sm">
								You're about to join <span className="font-medium text-fg">{org.name}</span>
							</p>
							<Button
								intent="primary"
								className="w-full"
								onPress={handleJoin}
								isDisabled={isJoining}
							>
								{isJoining ? <Loader className="mr-2 size-4" /> : null}
								{isJoining ? "Joining..." : "Join Workspace"}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
