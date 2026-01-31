import { useAtomSet } from "@effect-atom/atom-react"
import { useState } from "react"
import type { SandboxId } from "@hazel/schema"
import { Button } from "~/components/ui/button"
import { IconCloud } from "~/components/icons/icon-cloud"
import { IconLoader } from "~/components/icons/icon-loader"
import { IconTerminal } from "~/components/icons/icon-terminal"
import { IconTrash } from "~/components/icons/icon-trash"
import {
	destroySandboxMutation,
	provisionSandboxMutation,
	SANDBOX_PROVIDER_INFO,
	SANDBOX_STATUS_INFO,
	type SandboxData,
} from "~/atoms/sandbox-atoms"
import { exitToastAsync } from "~/lib/toast-exit"

interface SandboxListProps {
	sandboxes: SandboxData[]
	onSelectSandbox: (sandbox: SandboxData) => void
	onRefresh: () => void
}

export function SandboxList({ sandboxes, onSelectSandbox, onRefresh }: SandboxListProps) {
	const [isProvisioning, setIsProvisioning] = useState(false)

	const provisionSandbox = useAtomSet(provisionSandboxMutation, { mode: "promiseExit" })
	const destroySandbox = useAtomSet(destroySandboxMutation, { mode: "promiseExit" })

	const handleProvision = async (provider: "e2b" | "daytona") => {
		setIsProvisioning(true)
		try {
			await exitToastAsync(provisionSandbox({ payload: { provider } }))
				.loading("Provisioning sandbox...")
				.successMessage("Sandbox provisioning started")
				.onErrorTag("CredentialNotFoundError", (err) => ({
					title: "Missing credential",
					description: err.message || `No ${provider} API key configured.`,
					isRetryable: false,
				}))
				.onErrorTag("SandboxProviderUnavailableError", () => ({
					title: "Provider unavailable",
					description: "The sandbox provider is temporarily unavailable. Please try again later.",
					isRetryable: true,
				}))
				.run()

			onRefresh()
		} finally {
			setIsProvisioning(false)
		}
	}

	const handleDestroy = async (sandboxId: SandboxId) => {
		await exitToastAsync(destroySandbox({ payload: { id: sandboxId } }))
			.loading("Destroying sandbox...")
			.successMessage("Sandbox destroyed")
			.onErrorTag("SandboxNotFoundError", () => ({
				title: "Sandbox not found",
				description: "This sandbox may have already been deleted.",
				isRetryable: false,
			}))
			.onErrorTag("SandboxProviderUnavailableError", () => ({
				title: "Provider unavailable",
				description: "Could not contact the sandbox provider. Please try again.",
				isRetryable: true,
			}))
			.run()

		onRefresh()
	}

	const activeSandboxes = sandboxes.filter(
		(s) => s.status === "running" || s.status === "provisioning",
	)
	const inactiveSandboxes = sandboxes.filter(
		(s) => s.status !== "running" && s.status !== "provisioning",
	)

	return (
		<div className="space-y-6">
			{/* Provision buttons */}
			<div className="space-y-3">
				<h3 className="text-sm font-medium text-muted-fg">Start a new sandbox</h3>
				<div className="grid grid-cols-2 gap-3">
					{(["e2b", "daytona"] as const).map((provider) => {
						const info = SANDBOX_PROVIDER_INFO[provider]
						return (
							<button
								key={provider}
								type="button"
								disabled={isProvisioning}
								onClick={() => handleProvision(provider)}
								className="flex flex-col items-start rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-50"
							>
								<div className="flex items-center gap-2">
									<IconCloud className="size-4 fill-primary" />
									<span className="font-medium">{info.name}</span>
								</div>
								<span className="mt-1 text-xs text-muted-fg">{info.description}</span>
								{isProvisioning && (
									<IconLoader className="mt-2 size-4 animate-spin fill-muted-fg" />
								)}
							</button>
						)
					})}
				</div>
			</div>

			{/* Active sandboxes */}
			{activeSandboxes.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-muted-fg">Active Sandboxes</h3>
					<div className="space-y-2">
						{activeSandboxes.map((sandbox) => {
							const statusInfo = SANDBOX_STATUS_INFO[sandbox.status as keyof typeof SANDBOX_STATUS_INFO]
							const providerInfo = SANDBOX_PROVIDER_INFO[sandbox.provider as keyof typeof SANDBOX_PROVIDER_INFO]

							return (
								<div
									key={sandbox.id}
									className="group flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
								>
									<button
										type="button"
										onClick={() => onSelectSandbox(sandbox)}
										className="flex flex-1 items-center gap-3 text-left"
									>
										<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
											<IconTerminal className="size-5 fill-primary" />
										</div>
										<div>
											<p className="text-sm font-medium">
												{sandbox.name || `${providerInfo?.name} Sandbox`}
											</p>
											<div className="flex items-center gap-2 text-xs text-muted-fg">
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
												{sandbox.expiresAt && (
													<span>
														• Expires{" "}
														{new Date(sandbox.expiresAt).toLocaleTimeString()}
													</span>
												)}
											</div>
										</div>
									</button>
									<Button
										intent="plain"
										size="sq-sm"
										className="opacity-0 group-hover:opacity-100 transition-opacity"
										onPress={() => handleDestroy(sandbox.id)}
									>
										<IconTrash className="size-4 fill-danger" />
									</Button>
								</div>
							)
						})}
					</div>
				</div>
			)}

			{/* Inactive sandboxes */}
			{inactiveSandboxes.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-muted-fg">Recent</h3>
					<div className="space-y-2">
						{inactiveSandboxes.slice(0, 5).map((sandbox) => {
							const statusInfo = SANDBOX_STATUS_INFO[sandbox.status as keyof typeof SANDBOX_STATUS_INFO]
							const providerInfo = SANDBOX_PROVIDER_INFO[sandbox.provider as keyof typeof SANDBOX_PROVIDER_INFO]

							return (
								<div
									key={sandbox.id}
									className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 opacity-60"
								>
									<div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
										<IconTerminal className="size-4 fill-muted-fg" />
									</div>
									<div>
										<p className="text-sm">
											{sandbox.name || `${providerInfo?.name} Sandbox`}
										</p>
										<p className="text-xs text-muted-fg">{statusInfo?.label}</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			)}

			{sandboxes.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
					<IconCloud className="size-12 fill-muted-fg/50" />
					<h3 className="mt-4 font-medium">No sandboxes yet</h3>
					<p className="mt-1 text-sm text-muted-fg">
						Start a new sandbox to begin coding with AI agents.
					</p>
				</div>
			)}
		</div>
	)
}
