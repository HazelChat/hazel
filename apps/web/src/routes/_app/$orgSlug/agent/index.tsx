import { useAtomSet } from "@effect-atom/atom-react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { CredentialSetupDialog, SandboxList } from "~/components/agent"
import { Button } from "~/components/ui/button"
import { IconKey } from "~/components/icons/icon-key"
import { IconRobot } from "~/components/icons/icon-robot"
import { type CredentialData } from "~/atoms/credential-atoms"
import { type SandboxData } from "~/atoms/sandbox-atoms"
import { useOrganization } from "~/hooks/use-organization"

export const Route = createFileRoute("/_app/$orgSlug/agent/")({
	component: AgentPage,
})

function AgentPage() {
	const { slug: orgSlug } = useOrganization()
	const navigate = useNavigate()

	const [showCredentialDialog, setShowCredentialDialog] = useState(false)
	const [sandboxes, setSandboxes] = useState<SandboxData[]>([])
	const [credentials, setCredentials] = useState<CredentialData[]>([])

	// In a real implementation, these would use query atoms with live data
	const handleRefresh = useCallback(() => {
		// Refresh sandbox list
		console.log("Refreshing sandboxes...")
	}, [])

	const handleSelectSandbox = (sandbox: SandboxData) => {
		navigate({
			to: "/$orgSlug/agent/$sandboxId",
			params: { orgSlug: orgSlug!, sandboxId: sandbox.id },
		})
	}

	const hasCredentials = credentials.length > 0

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<IconRobot className="size-5 fill-primary" />
					</div>
					<div>
						<h1 className="text-lg font-semibold">AI Agent</h1>
						<p className="text-sm text-muted-fg">Run AI coding agents in cloud sandboxes</p>
					</div>
				</div>

				<Button intent="outline" size="sm" onPress={() => setShowCredentialDialog(true)}>
					<IconKey className="size-4" />
					{hasCredentials ? "Manage Keys" : "Setup Keys"}
				</Button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-6">
				{!hasCredentials ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
						<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
							<IconKey className="size-8 fill-primary" />
						</div>
						<h2 className="mt-6 text-lg font-semibold">Setup API Keys</h2>
						<p className="mt-2 max-w-md text-muted-fg">
							To use AI agents, you need to configure your API keys for providers like Anthropic
							(Claude) or OpenAI (Codex), plus a sandbox provider like E2B.
						</p>
						<Button
							intent="primary"
							className="mt-6"
							onPress={() => setShowCredentialDialog(true)}
						>
							<IconKey className="size-4" />
							Configure API Keys
						</Button>
					</div>
				) : (
					<SandboxList
						sandboxes={sandboxes}
						onSelectSandbox={handleSelectSandbox}
						onRefresh={handleRefresh}
					/>
				)}
			</div>

			{/* Credential Setup Dialog */}
			<CredentialSetupDialog isOpen={showCredentialDialog} onOpenChange={setShowCredentialDialog} />
		</div>
	)
}
