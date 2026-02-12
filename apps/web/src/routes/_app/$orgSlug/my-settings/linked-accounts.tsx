import { useAtomSet } from "@effect-atom/atom-react"
import type { UserId } from "@hazel/schema"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Exit } from "effect"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { SectionHeader } from "~/components/ui/section-header"
import { useUserIntegrationConnection } from "~/db/hooks"
import { useAuth } from "~/lib/auth"
import { HazelApiClient } from "~/lib/services/common/atom-client"

interface LinkedAccountsSearchParams {
	connection_status?: "success" | "error"
	error_code?: string
	provider?: string
}

export const Route = createFileRoute("/_app/$orgSlug/my-settings/linked-accounts")({
	component: LinkedAccountsSettings,
	validateSearch: (search: Record<string, unknown>): LinkedAccountsSearchParams => ({
		connection_status: search.connection_status as LinkedAccountsSearchParams["connection_status"],
		error_code: search.error_code as string | undefined,
		provider: search.provider as string | undefined,
	}),
})

function LinkedAccountsSettings() {
	const { orgSlug } = Route.useParams()
	const { connection_status, error_code, provider } = Route.useSearch()
	const navigate = useNavigate()
	const { user } = useAuth()
	const [isConnectingDiscord, setIsConnectingDiscord] = useState(false)
	const [isDisconnectingDiscord, setIsDisconnectingDiscord] = useState(false)
	const getOAuthUrlMutation = useAtomSet(HazelApiClient.mutation("integrations", "getOAuthUrl"), {
		mode: "promiseExit",
	})
	const disconnectMutation = useAtomSet(HazelApiClient.mutation("integrations", "disconnect"), {
		mode: "promiseExit",
	})

	const { connection: discordConnection, isConnected: isDiscordConnected } = useUserIntegrationConnection(
		user?.organizationId ?? null,
		user?.id as UserId | undefined,
		"discord",
	)

	useEffect(() => {
		if (!connection_status || provider !== "discord") return

		if (connection_status === "success") {
			toast.success("Discord account linked")
		} else {
			toast.error("Failed to link Discord account", {
				description: error_code ?? "Please try again.",
			})
		}

		navigate({
			to: "/$orgSlug/my-settings/linked-accounts",
			params: { orgSlug },
			search: {},
			replace: true,
		})
	}, [connection_status, provider, error_code, navigate, orgSlug])

	const handleConnectDiscord = async () => {
		if (!user?.organizationId) return
		setIsConnectingDiscord(true)
		const result = await getOAuthUrlMutation({
			path: { orgId: user.organizationId, provider: "discord" },
			urlParams: { level: "user" },
		})

		if (Exit.isSuccess(result)) {
			window.location.href = result.value.authorizationUrl
			return
		}

		setIsConnectingDiscord(false)
		toast.error("Failed to start Discord linking flow")
	}

	const handleDisconnectDiscord = async () => {
		if (!user?.organizationId) return
		setIsDisconnectingDiscord(true)
		const result = await disconnectMutation({
			path: { orgId: user.organizationId, provider: "discord" },
			urlParams: { level: "user" },
		})

		if (Exit.isSuccess(result)) {
			toast.success("Discord account unlinked")
		} else {
			toast.error("Failed to unlink Discord account")
		}

		setIsDisconnectingDiscord(false)
	}

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Linked Accounts</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Connect external accounts to enhance your experience.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="max-w-xl">
				<div className="rounded-xl border border-border bg-bg p-4">
					<div className="flex items-start gap-4">
						<img
							src="https://cdn.brandfetch.io/discord.com/w/64/h/64/theme/dark/icon"
							alt="Discord"
							className="size-10 rounded-lg"
						/>
						<div className="flex-1">
							<p className="font-medium text-sm text-fg">Discord</p>
							<p className="text-muted-fg text-xs">
								{isDiscordConnected
									? `Linked as ${discordConnection?.externalAccountName ?? "Discord account"}. Synced Discord messages will be attributed to your Hazel account.`
									: "Link your Discord account so synced messages from Discord are attributed to you."}
							</p>
							<div className="mt-3">
								{isDiscordConnected ? (
									<Button
										intent="danger"
										size="sm"
										onPress={handleDisconnectDiscord}
										isDisabled={isDisconnectingDiscord}
									>
										{isDisconnectingDiscord ? "Unlinking..." : "Unlink"}
									</Button>
								) : (
									<Button
										intent="primary"
										size="sm"
										onPress={handleConnectDiscord}
										isDisabled={isConnectingDiscord}
									>
										{isConnectingDiscord ? "Redirecting..." : "Link Discord"}
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
