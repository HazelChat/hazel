import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/domain"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DiscordChannelMappings } from "~/components/integrations/discord-channel-mappings"
import { Button, buttonStyles } from "~/components/ui/button"
import { SectionHeader } from "~/components/ui/section-header"
import { useIntegrationConnection } from "~/db/hooks"
import { useOrganization } from "~/hooks/use-organization"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { exitToast } from "~/lib/toast-exit"
import { getBrandfetchIcon, getIntegrationById } from "../../../../../lib/integrations/__data"

/**
 * Search params for OAuth callback redirect
 */
interface DiscordSearchParams {
	connection_status?: "success" | "error"
	error_code?: string
}

/**
 * Get user-friendly error message from error code
 */
const getErrorMessageFromCode = (errorCode?: string): string => {
	switch (errorCode) {
		case "token_exchange_failed":
			return "Could not authenticate with Discord. Please try again."
		case "account_info_failed":
			return "Could not fetch your Discord server information."
		case "db_error":
			return "A database error occurred. Please try again."
		case "encryption_error":
			return "A security error occurred. Please try again."
		case "invalid_state":
			return "The connection request expired. Please try again."
		default:
			return "An unexpected error occurred. Please try again."
	}
}

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations/discord")({
	component: DiscordIntegrationPage,
	validateSearch: (search: Record<string, unknown>): DiscordSearchParams => ({
		connection_status: search.connection_status as DiscordSearchParams["connection_status"],
		error_code: search.error_code as string | undefined,
	}),
})

function DiscordIntegrationPage() {
	const { orgSlug } = Route.useParams()
	const { connection_status, error_code } = Route.useSearch()
	const navigate = useNavigate()
	const { organizationId } = useOrganization()
	const integration = getIntegrationById("discord")!
	const [isConnecting, setIsConnecting] = useState(false)
	const [isDisconnecting, setIsDisconnecting] = useState(false)
	const [isVerifying, setIsVerifying] = useState(false)

	// Query connection from TanStack DB collection (real-time sync via Electric)
	const { connection, isConnected } = useIntegrationConnection(organizationId ?? null, "discord")

	// Handle OAuth callback result from URL params
	useEffect(() => {
		if (!connection_status) return

		if (connection_status === "success") {
			setIsVerifying(true)
			toast.success("Connected to Discord", {
				description: "Your Discord server has been successfully connected.",
			})
		} else if (connection_status === "error") {
			const errorMessage = getErrorMessageFromCode(error_code)
			toast.error("Failed to connect to Discord", {
				description: errorMessage,
			})
		}

		// Clear search params
		navigate({
			to: "/$orgSlug/settings/integrations/discord",
			params: { orgSlug },
			search: {},
			replace: true,
		})
	}, [connection_status, error_code, orgSlug, navigate])

	// Stop verifying when Electric sync completes and connection becomes available
	useEffect(() => {
		if (isVerifying && isConnected) {
			setIsVerifying(false)
		}
	}, [isVerifying, isConnected])

	// Mutation for disconnect
	const disconnectMutation = useAtomSet(HazelApiClient.mutation("integrations", "disconnect"), {
		mode: "promiseExit",
	})

	const handleConnect = () => {
		if (!organizationId) return
		setIsConnecting(true)

		// Navigate directly to the OAuth endpoint
		const backendUrl = import.meta.env.VITE_BACKEND_URL
		const oauthUrl = `${backendUrl}/integrations/${organizationId}/discord/oauth`
		window.location.href = oauthUrl
	}

	const handleDisconnect = async () => {
		if (!organizationId) return
		setIsDisconnecting(true)
		const exit = await disconnectMutation({
			path: { orgId: organizationId, provider: "discord" },
		})

		exitToast(exit)
			.onErrorTag("IntegrationNotConnectedError", () => ({
				title: "Integration not connected",
				description: "Discord is already disconnected.",
				isRetryable: false,
			}))
			.onErrorTag("UnsupportedProviderError", () => ({
				title: "Unsupported provider",
				description: "Discord integration is not supported.",
				isRetryable: false,
			}))
			.run()
		setIsDisconnecting(false)
	}

	const handleBack = () => {
		navigate({ to: "/$orgSlug/settings/integrations", params: { orgSlug } })
	}

	const externalAccountName = connection?.externalAccountName ?? null

	return (
		<div className="flex min-w-0 flex-col gap-6 overflow-hidden px-4 lg:px-8">
			{/* Back link */}
			<button
				type="button"
				onClick={handleBack}
				className="-ml-1 flex w-fit items-center gap-1 text-muted-fg text-sm transition-colors hover:text-fg"
			>
				<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
				<span>Back to integrations</span>
			</button>

			{/* Header */}
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="flex items-center gap-4">
						<div
							className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-md ring-1 ring-black/8"
							style={{ backgroundColor: `${integration.brandColor}10` }}
						>
							<img
								src={getBrandfetchIcon(integration.logoDomain, {
									theme: "light",
									type: integration.logoType,
								})}
								alt="Discord logo"
								className="size-12 object-contain"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-3">
								<SectionHeader.Heading>{integration.name}</SectionHeader.Heading>
								<ConnectionBadge connected={isConnected} />
							</div>
							<SectionHeader.Subheading>{integration.description}</SectionHeader.Subheading>
						</div>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{/* Main content */}
			<div className="flex flex-col gap-6">
				{/* Connection card */}
				<div className="overflow-hidden rounded-xl border border-border bg-bg">
					<div className="border-border border-b bg-bg-muted/30 px-5 py-3">
						<h3 className="font-semibold text-fg text-sm">Connection</h3>
					</div>
					<div className="p-5">
						{isVerifying ? (
							<VerifyingState />
						) : isConnected ? (
							<ConnectedState
								externalAccountName={externalAccountName}
								isDisconnecting={isDisconnecting}
								onDisconnect={handleDisconnect}
							/>
						) : (
							<DisconnectedState isConnecting={isConnecting} onConnect={handleConnect} />
						)}
					</div>
				</div>

				{/* Channel Mappings - only show when connected */}
				{isConnected && organizationId && (
					<DiscordChannelMappings
						organizationId={organizationId as OrganizationId}
						guildId={connection?.externalAccountId ?? null}
					/>
				)}
			</div>
		</div>
	)
}

function ConnectionBadge({ connected }: { connected: boolean }) {
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs ${
				connected
					? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
					: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
			}`}
		>
			<span className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-400"}`} />
			{connected ? "Connected" : "Not connected"}
		</span>
	)
}

function DisconnectedState({ isConnecting, onConnect }: { isConnecting: boolean; onConnect: () => void }) {
	return (
		<div className="flex flex-col items-center gap-4 py-4 text-center">
			<div className="flex size-14 items-center justify-center rounded-full bg-bg-muted">
				<svg
					className="size-6 text-muted-fg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
					/>
				</svg>
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-medium text-fg text-sm">Connect your Discord server</p>
				<p className="text-muted-fg text-sm">
					You'll be redirected to Discord to authorize the connection.
				</p>
			</div>
			<Button
				intent="primary"
				size="md"
				className="mt-2"
				onPress={onConnect}
				isDisabled={isConnecting}
				style={{ backgroundColor: "#5865F2" }}
			>
				{isConnecting ? (
					<>
						<svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Connecting...
					</>
				) : (
					<>
						<img
							src={getBrandfetchIcon("discord.com", { theme: "light", type: "symbol" })}
							alt=""
							className="size-4 rounded object-contain"
						/>
						Connect with Discord
					</>
				)}
			</Button>
		</div>
	)
}

function VerifyingState() {
	return (
		<div className="flex flex-col items-center gap-4 py-4 text-center">
			<div className="flex size-14 items-center justify-center rounded-full bg-bg-muted">
				<svg className="size-6 animate-spin text-muted-fg" fill="none" viewBox="0 0 24 24">
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-medium text-fg text-sm">Verifying connection...</p>
				<p className="text-muted-fg text-sm">Please wait while we verify your Discord connection.</p>
			</div>
		</div>
	)
}

function ConnectedState({
	externalAccountName,
	isDisconnecting,
	onDisconnect,
}: {
	externalAccountName: string | null
	isDisconnecting: boolean
	onDisconnect: () => void
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
					<svg
						className="size-5 text-emerald-600 dark:text-emerald-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div className="flex flex-col gap-0.5">
					<p className="font-medium text-fg text-sm">Connected to Discord</p>
					{externalAccountName && <p className="text-muted-fg text-xs">{externalAccountName}</p>}
				</div>
			</div>
			<Button intent="danger" size="sm" onPress={onDisconnect} isDisabled={isDisconnecting}>
				{isDisconnecting ? "Disconnecting..." : "Disconnect"}
			</Button>
		</div>
	)
}
