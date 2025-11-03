import { useAtomSet } from "@effect-atom/atom-react"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
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
import { useOrganization } from "~/hooks/use-organization"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { toastExit } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/debug")({
	component: DebugSettings,
})

function DebugSettings() {
	const [showMockDataDialog, setShowMockDataDialog] = useState(false)
	const [isGeneratingMockData, setIsGeneratingMockData] = useState(false)

	const { organizationId } = useOrganization()

	const generateMockData = useAtomSet(HazelApiClient.mutation("mockData", "generate"), {
		mode: "promiseExit",
	})

	const handleGenerateMockData = async () => {
		setIsGeneratingMockData(true)
		const _exit = await toastExit(
			generateMockData({
				payload: {
					organizationId: organizationId!,
					userCount: 10,
					channelCount: 5,
					messageCount: 50,
				},
			}),
			{
				loading: "Generating mock data...",
				success: (result) => {
					setShowMockDataDialog(false)
					return `Mock data generated successfully! Created ${result.created.users} users, ${result.created.channels} channels, and ${result.created.messages} messages.`
				},
				error: "Failed to generate mock data",
			},
		)
		setIsGeneratingMockData(false)
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
						<ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-warning" />
						<div className="flex-1">
							<p className="font-medium text-warning">Development Tools Only</p>
							<p className="mt-1 text-fg text-sm">
								These tools are intended for development and testing purposes only. Use with
								caution.
							</p>
						</div>
					</div>
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
									<li>8 sample users with realistic profiles</li>
									<li>Public and private channels</li>
									<li>Direct message conversations</li>
									<li>Messages with reactions and threads</li>
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
									<li>8 mock users with profiles</li>
									<li>5 channels (public and private)</li>
									<li>Direct message conversations</li>
									<li>Sample messages with reactions</li>
									<li>Thread replies</li>
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
