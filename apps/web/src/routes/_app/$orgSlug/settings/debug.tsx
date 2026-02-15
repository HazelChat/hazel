import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { type Notification } from "@hazel/domain/models"
import { IconWarning } from "~/components/icons/icon-warning"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { reactScanEnabledAtom } from "~/atoms/react-scan-atoms"
import { IconServers } from "~/components/icons/icon-servers"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Modal, ModalContent } from "~/components/ui/modal"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { typingIndicatorCollection } from "~/db/collections"
import { useCollectionError } from "~/hooks/use-collection-error"
import { useOrganization } from "~/hooks/use-organization"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import {
	clearNotificationDiagnostics,
	getNotificationDiagnostics,
	notificationOrchestrator,
	subscribeNotificationDiagnostics,
} from "~/lib/notifications"
import {
	clearTypingDiagnostics,
	getTypingDiagnostics,
	subscribeTypingDiagnostics,
} from "~/lib/typing-diagnostics"
import { getNativeNotificationPermissionState, testNativeNotification } from "~/lib/native-notifications"
import { notificationSoundManager } from "~/lib/notification-sound-manager"
import { exitToastAsync } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/debug")({
	beforeLoad: ({ params }) => {
		if (import.meta.env.PROD) {
			throw redirect({
				to: "/$orgSlug/settings",
				params: { orgSlug: params.orgSlug },
			})
		}
	},
	component: DebugSettings,
})

function DebugSettings() {
	const [showMockDataDialog, setShowMockDataDialog] = useState(false)
	const [isGeneratingMockData, setIsGeneratingMockData] = useState(false)
	const [notificationPermission, setNotificationPermission] = useState<
		"granted" | "denied" | "unavailable" | "loading"
	>("loading")

	const { organizationId } = useOrganization()
	const notificationDiagnostics = useSyncExternalStore(
		subscribeNotificationDiagnostics,
		getNotificationDiagnostics,
	)
	const latestDiagnostics = useMemo(() => notificationDiagnostics.slice(0, 10), [notificationDiagnostics])
	const typingDiagnostics = useSyncExternalStore(subscribeTypingDiagnostics, getTypingDiagnostics)
	const latestTypingDiagnostics = useMemo(() => typingDiagnostics.slice(0, 20), [typingDiagnostics])
	const typingCollectionError = useCollectionError(typingIndicatorCollection)

	const reactScanEnabled = useAtomValue(reactScanEnabledAtom)
	const setReactScanEnabled = useAtomSet(reactScanEnabledAtom)

	const generateMockData = useAtomSet(HazelApiClient.mutation("mockData", "generate"), {
		mode: "promiseExit",
	})

	useEffect(() => {
		getNativeNotificationPermissionState()
			.then(setNotificationPermission)
			.catch(() => setNotificationPermission("unavailable"))
	}, [])

	const handleGenerateMockData = async () => {
		setIsGeneratingMockData(true)
		await exitToastAsync(
			generateMockData({
				payload: {
					organizationId: organizationId!,
				},
			}),
		)
			.loading("Generating mock data...")
			.onSuccess(() => setShowMockDataDialog(false))
			.successMessage(
				(result) =>
					`Mock data generated! Created ${result.created.users} users, ${result.created.channels} channels, ${result.created.messages} messages, and ${result.created.threads} thread.`,
			)
			.run()
		setIsGeneratingMockData(false)
	}

	const handleSyntheticNotification = () => {
		const now = new Date()
		const syntheticNotification: typeof Notification.Model.Type = {
			id: `synthetic-${Date.now()}` as any,
			memberId: `synthetic-member-${Date.now()}` as any,
			targetedResourceId: null,
			targetedResourceType: null,
			resourceId: null,
			resourceType: null,
			createdAt: now,
			readAt: null,
		}

		notificationOrchestrator.enqueue([
			{
				id: syntheticNotification.id,
				notification: syntheticNotification,
				receivedAt: Date.now(),
			},
		])
	}

	const handleTestNativeNotification = async () => {
		await testNativeNotification()
		setNotificationPermission(await getNativeNotificationPermissionState())
	}

	return (
		<>
			<form className="flex flex-col gap-6 px-4 lg:px-8">
				<SectionHeader.Root>
					<SectionHeader.Group>
						<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
							<SectionHeader.Heading>Debug Tools</SectionHeader.Heading>
							<SectionHeader.Subheading>
								Development and testing utilities for your organization.
							</SectionHeader.Subheading>
						</div>
					</SectionHeader.Group>
				</SectionHeader.Root>

				{/* Warning Banner */}
				<div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
					<div className="flex gap-3">
						<IconWarning className="mt-0.5 size-5 shrink-0 text-warning" />
						<div className="flex-1">
							<p className="font-medium text-warning">Development Tools Only</p>
							<p className="mt-1 text-fg text-sm">
								These tools are intended for development and testing purposes only. Use with
								caution.
							</p>
						</div>
					</div>
				</div>

				{/* React-Scan Toggle Section */}
				<div className="flex flex-col gap-5">
					<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
						<SectionLabel.Root
							size="sm"
							title="React Performance Scanner"
							description="Visualize component re-renders in real-time."
						/>

						<div className="flex flex-col gap-4">
							<div className="rounded-lg border border-border bg-secondary/50 p-4">
								<Switch
									isSelected={reactScanEnabled ?? false}
									onChange={(isSelected) => {
										setReactScanEnabled(isSelected)
										// Reload the page to apply changes
										window.location.reload()
									}}
								>
									<SwitchLabel>Enable React-Scan</SwitchLabel>
								</Switch>
								<p className="mt-3 text-muted-fg text-sm">
									When enabled, React-Scan highlights components that re-render, helping you
									identify performance bottlenecks. The page will reload when toggling this
									setting.
								</p>
							</div>
						</div>
					</div>

					<hr className="h-px w-full border-none bg-border" />
				</div>

				{/* Mock Data Section */}
				<div className="flex flex-col gap-5">
					<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
						<SectionLabel.Root
							size="sm"
							title="Mock Data Generation"
							description="Generate sample data for testing."
						/>

						<div className="flex flex-col gap-4">
							<div className="rounded-lg border border-border bg-secondary/50 p-4">
								<div className="flex items-start gap-3">
									<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5">
										<IconServers className="size-6 text-primary" />
									</div>
									<div className="flex-1">
										<h3 className="font-medium text-fg">Generate Sample Data</h3>
										<p className="mt-1 text-muted-fg text-sm">
											Quickly populate your organization with realistic test data
											including users, channels, and messages.
										</p>
										<Button
											size="sm"
											intent="secondary"
											onPress={() => setShowMockDataDialog(true)}
											className="mt-3"
										>
											Generate Mock Data
										</Button>
									</div>
								</div>
							</div>

							<div className="text-muted-fg text-xs">
								<p>Mock data includes:</p>
								<ul className="mt-1 list-inside list-disc space-y-0.5">
									<li>7 team members with professional profiles</li>
									<li>12 channels with emoji icons in 4 sections</li>
									<li>Messages with replies and threads</li>
								</ul>
							</div>
						</div>
					</div>

					<hr className="h-px w-full border-none bg-border" />

					{/* Additional Debug Tools Section */}
					<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
						<SectionLabel.Root
							size="sm"
							title="System Information"
							description="View system and environment details."
						/>

						<div className="rounded-lg border border-border bg-secondary/50 p-4">
							<div className="space-y-2 font-mono text-fg text-xs">
								<div>
									<span className="text-muted-fg">Environment:</span>{" "}
									<span>{import.meta.env.MODE || "development"}</span>
								</div>
								<div>
									<span className="text-muted-fg">Organization ID:</span>{" "}
									<span>{organizationId}</span>
								</div>
								<div>
									<span className="text-muted-fg">Backend URL:</span>{" "}
									<span className="break-all">
										{import.meta.env.VITE_BACKEND_URL || "N/A"}
									</span>
								</div>
								<div>
									<span className="text-muted-fg">Electric URL:</span>{" "}
									<span className="break-all">
										{import.meta.env.VITE_ELECTRIC_URL || "N/A"}
									</span>
								</div>
							</div>
						</div>
					</div>

					<hr className="h-px w-full border-none bg-border" />

					<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
						<SectionLabel.Root
							size="sm"
							title="Notification Diagnostics"
							description="Inspect orchestrator decisions and sink outcomes."
						/>

						<div className="space-y-4 rounded-lg border border-border bg-secondary/50 p-4">
							<div className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
								<div>
									<span className="text-muted-fg">Native permission:</span>{" "}
									<span>{notificationPermission}</span>
								</div>
								<div>
									<span className="text-muted-fg">Sound primed:</span>{" "}
									<span>{notificationSoundManager.getIsPrimed() ? "yes" : "no"}</span>
								</div>
								<div className="sm:col-span-2">
									<span className="text-muted-fg">Diagnostics records:</span>{" "}
									<span>{notificationDiagnostics.length}</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button size="sm" intent="secondary" onPress={handleSyntheticNotification}>
									Run synthetic notification
								</Button>
								<Button
									size="sm"
									intent="outline"
									onPress={() => notificationSoundManager.testSound()}
								>
									Test sound
								</Button>
								<Button size="sm" intent="outline" onPress={handleTestNativeNotification}>
									Test native
								</Button>
								<Button
									size="sm"
									intent="plain"
									onPress={() => {
										clearNotificationDiagnostics()
									}}
								>
									Clear diagnostics
								</Button>
							</div>

							<div className="max-h-64 overflow-auto rounded border border-border bg-bg p-2">
								{latestDiagnostics.length === 0 ? (
									<p className="text-muted-fg text-xs">No diagnostics yet.</p>
								) : (
									<div className="space-y-2">
										{latestDiagnostics.map((record) => (
											<div
												key={`${record.eventId}-${record.finishedAt}`}
												className="rounded border border-border/60 p-2 text-xs"
											>
												<div className="font-mono text-muted-fg">
													{new Date(record.finishedAt).toLocaleTimeString()} ·{" "}
													{record.durationMs}ms
												</div>
												<div className="mt-1 font-mono">
													event={record.eventId} decision(sound=
													{record.decision.playSound ? "1" : "0"}, native=
													{record.decision.sendNative ? "1" : "0"})
												</div>
												<div className="mt-1 flex flex-wrap gap-1">
													{record.results.map((result) => (
														<span
															key={`${record.eventId}-${result.sink}`}
															className="rounded border border-border px-1.5 py-0.5 font-mono text-muted-fg"
														>
															{result.sink}:{result.status}:{result.reason}
														</span>
													))}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					<hr className="h-px w-full border-none bg-border" />

					<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
						<SectionLabel.Root
							size="sm"
							title="Typing Diagnostics"
							description="Trace typing indicator lifecycle and collection health."
						/>

						<div className="space-y-4 rounded-lg border border-border bg-secondary/50 p-4">
							<div className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
								<div>
									<span className="text-muted-fg">Collection status:</span>{" "}
									<span>{typingCollectionError.status}</span>
								</div>
								<div>
									<span className="text-muted-fg">Collection error:</span>{" "}
									<span>{typingCollectionError.isError ? "yes" : "no"}</span>
								</div>
								<div>
									<span className="text-muted-fg">Collection errors total:</span>{" "}
									<span>{typingCollectionError.errorCount}</span>
								</div>
								<div>
									<span className="text-muted-fg">Diagnostics records:</span>{" "}
									<span>{typingDiagnostics.length}</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									intent="outline"
									onPress={() => {
										typingCollectionError.clearError()
									}}
								>
									Clear collection error
								</Button>
								<Button
									size="sm"
									intent="plain"
									onPress={() => {
										clearTypingDiagnostics()
									}}
								>
									Clear diagnostics
								</Button>
							</div>

							<div className="max-h-64 overflow-auto rounded border border-border bg-bg p-2">
								{latestTypingDiagnostics.length === 0 ? (
									<p className="text-muted-fg text-xs">No typing diagnostics yet.</p>
								) : (
									<div className="space-y-2">
										{latestTypingDiagnostics.map((record) => (
											<div
												key={record.id}
												className="rounded border border-border/60 p-2 text-xs"
											>
												<div className="font-mono text-muted-fg">
													{new Date(record.at).toLocaleTimeString()} · {record.kind}
												</div>
												<div className="mt-1 font-mono text-fg">
													channel={record.channelId ?? "-"} member=
													{record.memberId ?? "-"}
													indicator={record.typingIndicatorId ?? "-"}
												</div>
												{record.details && (
													<div className="mt-1 break-all font-mono text-muted-fg">
														{JSON.stringify(record.details)}
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</form>

			{/* Mock Data Generation Modal */}
			<Modal>
				<ModalContent isOpen={showMockDataDialog} onOpenChange={setShowMockDataDialog} size="lg">
					<Dialog>
						<DialogHeader>
							<DialogTitle>Generate Mock Data</DialogTitle>
							<DialogDescription>
								Create sample data for development and testing
							</DialogDescription>
						</DialogHeader>

						<DialogBody>
							<div className="space-y-4">
								<p className="text-muted-fg text-sm">
									This will create sample data in your current organization including:
								</p>
								<ul className="list-disc space-y-1 pl-5 text-muted-fg text-sm">
									<li>
										7 team members (Sarah, Marcus, Emily, Alex, Jordan, Taylor, Casey)
									</li>
									<li>12 channels with emoji icons in 4 sections</li>
									<li>Messages with replies and a discussion thread</li>
								</ul>
								<div className="rounded-lg border border-warning/20 bg-warning/10 p-3">
									<p className="font-medium text-sm text-warning">
										⚠️ Warning: This is intended for development purposes only.
									</p>
								</div>
							</div>
						</DialogBody>

						<DialogFooter>
							<DialogClose intent="secondary" isDisabled={isGeneratingMockData}>
								Cancel
							</DialogClose>
							<Button
								intent="primary"
								onPress={handleGenerateMockData}
								isPending={isGeneratingMockData}
							>
								{isGeneratingMockData ? "Generating..." : "Generate Data"}
							</Button>
						</DialogFooter>
					</Dialog>
				</ModalContent>
			</Modal>
		</>
	)
}
