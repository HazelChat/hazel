import { useAtomSet } from "@effect-atom/atom-react"
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router"
import { useState } from "react"
import type { SandboxId, AgentSessionId } from "@hazel/schema"
import { SessionPanel } from "~/components/agent"
import { Button } from "~/components/ui/button"
import { IconArrowLeft } from "~/components/icons/icon-arrow-left"
import { IconCloud } from "~/components/icons/icon-cloud"
import { IconLoader } from "~/components/icons/icon-loader"
import { IconPlus } from "~/components/icons/icon-plus"
import { IconTerminal } from "~/components/icons/icon-terminal"
import { AGENT_TYPE_INFO, createSessionMutation, type AgentSessionData } from "~/atoms/agent-session-atoms"
import { SANDBOX_PROVIDER_INFO, SANDBOX_STATUS_INFO, type SandboxData } from "~/atoms/sandbox-atoms"
import { useOrganization } from "~/hooks/use-organization"
import { exitToastAsync } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/agent/$sandboxId")({
	component: SandboxPage,
})

function SandboxPage() {
	const { slug: orgSlug } = useOrganization()
	const { sandboxId } = useParams({ from: "/_app/$orgSlug/agent/$sandboxId" })
	const _navigate = useNavigate()

	const [selectedSession, setSelectedSession] = useState<AgentSessionData | null>(null)
	const [isCreatingSession, setIsCreatingSession] = useState(false)
	const [sessions, setSessions] = useState<AgentSessionData[]>([])

	// In a real implementation, this would use a query atom
	const [sandbox, setSandbox] = useState<SandboxData | null>(null)

	const createSession = useAtomSet(createSessionMutation, { mode: "promiseExit" })

	const handleCreateSession = async (agent: "claude" | "codex" | "opencode") => {
		if (!sandboxId) return

		setIsCreatingSession(true)
		try {
			const result = await exitToastAsync(
				createSession({
					payload: {
						sandboxId: sandboxId as SandboxId,
						agent,
					},
				}),
			)
				.loading("Creating session...")
				.successMessage("Session created")
				.onErrorTag("CredentialNotFoundError", (err) => ({
					title: "Missing API key",
					description: err.message || `No API key configured for ${agent}.`,
					isRetryable: false,
				}))
				.onErrorTag("SandboxExpiredError", () => ({
					title: "Sandbox expired",
					description: "This sandbox has expired. Please create a new one.",
					isRetryable: false,
				}))
				.onErrorTag("SandboxNotFoundError", () => ({
					title: "Sandbox not found",
					description: "This sandbox no longer exists.",
					isRetryable: false,
				}))
				.onErrorTag("SandboxAgentError", (err) => ({
					title: "Agent error",
					description: err.message || "Could not create session.",
					isRetryable: true,
				}))
				.run()

			// Session created - would navigate or select it
		} finally {
			setIsCreatingSession(false)
		}
	}

	const statusInfo = sandbox
		? SANDBOX_STATUS_INFO[sandbox.status as keyof typeof SANDBOX_STATUS_INFO]
		: null
	const providerInfo = sandbox
		? SANDBOX_PROVIDER_INFO[sandbox.provider as keyof typeof SANDBOX_PROVIDER_INFO]
		: null

	const activeSessions = sessions.filter(
		(s) => s.status === "active" || s.status === "creating" || s.status === "waiting_input",
	)

	if (!sandbox) {
		return (
			<div className="flex h-full items-center justify-center">
				<IconLoader className="size-8 animate-spin fill-muted-fg" />
			</div>
		)
	}

	return (
		<div className="flex h-full">
			{/* Sidebar */}
			<div className="w-72 flex-shrink-0 border-r border-border bg-secondary/30">
				{/* Back link */}
				<div className="border-b border-border p-4">
					<Link
						to="/$orgSlug/agent"
						params={{ orgSlug: orgSlug! }}
						className="flex items-center gap-2 text-sm text-muted-fg hover:text-fg"
					>
						<IconArrowLeft className="size-4" />
						Back to sandboxes
					</Link>
				</div>

				{/* Sandbox info */}
				<div className="border-b border-border p-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
							<IconCloud className="size-5 fill-primary" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">
								{sandbox.name || `${providerInfo?.name} Sandbox`}
							</p>
							<div className="flex items-center gap-1.5 text-xs text-muted-fg">
								<span
									className={`inline-block size-2 rounded-full ${
										statusInfo?.color === "green"
											? "bg-success"
											: statusInfo?.color === "yellow"
												? "bg-warning animate-pulse"
												: "bg-muted-fg"
									}`}
								/>
								<span>{statusInfo?.label}</span>
							</div>
						</div>
					</div>
				</div>

				{/* New session button */}
				{sandbox.status === "running" && (
					<div className="border-b border-border p-4">
						<p className="mb-3 text-xs font-medium text-muted-fg">New Session</p>
						<div className="space-y-2">
							{(["claude", "codex", "opencode"] as const).map((agent) => {
								const info = AGENT_TYPE_INFO[agent]
								return (
									<button
										key={agent}
										type="button"
										disabled={isCreatingSession}
										onClick={() => handleCreateSession(agent)}
										className="flex w-full items-center gap-2 rounded-lg border border-border p-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-50"
									>
										<IconPlus className="size-4 fill-muted-fg" />
										<span>{info.name}</span>
									</button>
								)
							})}
						</div>
					</div>
				)}

				{/* Sessions list */}
				<div className="flex-1 overflow-y-auto p-4">
					<p className="mb-3 text-xs font-medium text-muted-fg">Sessions</p>
					{activeSessions.length === 0 ? (
						<p className="text-xs text-muted-fg">No active sessions</p>
					) : (
						<div className="space-y-2">
							{activeSessions.map((session) => {
								const agentInfo =
									AGENT_TYPE_INFO[session.agent as keyof typeof AGENT_TYPE_INFO]
								const isSelected = selectedSession?.id === session.id

								return (
									<button
										key={session.id}
										type="button"
										onClick={() => setSelectedSession(session)}
										className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors ${
											isSelected
												? "border-primary bg-primary/10"
												: "border-border hover:border-primary/50"
										}`}
									>
										<IconTerminal className="size-4 fill-primary" />
										<span>{agentInfo?.name}</span>
									</button>
								)
							})}
						</div>
					)}
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1">
				{selectedSession ? (
					<SessionPanel session={selectedSession} />
				) : (
					<div className="flex h-full flex-col items-center justify-center text-center">
						<IconTerminal className="size-16 fill-muted-fg/50" />
						<h2 className="mt-4 font-medium">No session selected</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-fg">
							{sandbox.status === "running"
								? "Create a new session or select an existing one from the sidebar."
								: "This sandbox is not running. Wait for it to start or create a new one."}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
