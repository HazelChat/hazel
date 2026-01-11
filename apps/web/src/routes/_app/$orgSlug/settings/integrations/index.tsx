import { useAtomSet } from "@effect-atom/atom-react"
import type { IntegrationConnection } from "@hazel/domain/models"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { listOrganizationWebhooksMutation, type WebhookData } from "~/atoms/channel-webhook-atoms"
import IconPlus from "~/components/icons/icon-plus"
import { RequestIntegrationModal } from "~/components/modals/request-integration-modal"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { SectionHeader } from "~/components/ui/section-header"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"
import { useIntegrationConnections } from "~/db/hooks"
import { useAuth } from "~/lib/auth"
import {
	categories,
	getBrandfetchIcon,
	type Integration,
	integrations,
} from "../../../../../lib/integrations/__data"

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations/")({
	component: IntegrationsSettings,
})

function IntegrationsSettings() {
	const [selectedCategory, setSelectedCategory] = useState<string>("all")
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
	const { orgSlug } = Route.useParams()
	const navigate = useNavigate()
	const { user } = useAuth()

	// Query all integration connections for the organization (OAuth-based)
	const { isConnected } = useIntegrationConnections(user?.organizationId ?? null)

	// Fetch webhooks for webhook-based integrations (OpenStatus, Railway)
	const [webhooks, setWebhooks] = useState<readonly WebhookData[]>([])
	const listWebhooks = useAtomSet(listOrganizationWebhooksMutation, { mode: "promiseExit" })

	useEffect(() => {
		if (!user?.organizationId) return
		listWebhooks({ payload: {} }).then((exit) => {
			if (exit._tag === "Success") {
				setWebhooks(exit.value.data)
			}
		})
	}, [user?.organizationId, listWebhooks])

	// Map webhook names to integration IDs (normalize to lowercase)
	const webhookProviders = useMemo(() => {
		const providers = new Set<string>()
		for (const webhook of webhooks) {
			providers.add(webhook.name.toLowerCase())
		}
		return providers
	}, [webhooks])

	// Combined check for both OAuth and webhook integrations
	const isIntegrationConnected = (integrationId: string) => {
		// Check OAuth connections first
		if (isConnected(integrationId as IntegrationConnection.IntegrationProvider)) {
			return true
		}
		// Check webhook-based integrations (openstatus, railway)
		return webhookProviders.has(integrationId)
	}

	const filteredIntegrations =
		selectedCategory === "all"
			? integrations
			: integrations.filter((i) => i.category === selectedCategory)

	const handleIntegrationClick = (integrationId: string) => {
		navigate({
			to: "/$orgSlug/settings/integrations/$integrationId",
			params: { orgSlug, integrationId },
		})
	}

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-1">
						<SectionHeader.Heading>Integrations</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Connect your favorite tools to supercharge your workflow.
						</SectionHeader.Subheading>
					</div>
					<SectionHeader.Actions>
						<Button intent="secondary" size="md" onPress={() => setIsRequestModalOpen(true)}>
							<IconPlus data-slot="icon" />
							Request integration
						</Button>
					</SectionHeader.Actions>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<Tabs
				className="hidden w-full lg:flex"
				selectedKey={selectedCategory}
				onSelectionChange={(value) => setSelectedCategory(value as string)}
			>
				<TabList className="w-full">
					{categories.map((category) => (
						<Tab key={category.id} id={category.id}>
							{category.label}
						</Tab>
					))}
				</TabList>
			</Tabs>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{filteredIntegrations.map((integration) => (
					<IntegrationCard
						key={integration.id}
						integration={integration}
						connected={isIntegrationConnected(integration.id)}
						onClick={() => handleIntegrationClick(integration.id)}
					/>
				))}
			</div>

			{filteredIntegrations.length === 0 && (
				<EmptyState
					title="No integrations found"
					description="No integrations found in this category."
				/>
			)}

			<RequestIntegrationModal isOpen={isRequestModalOpen} onOpenChange={setIsRequestModalOpen} />
		</div>
	)
}

function IntegrationCard({
	integration,
	connected,
	onClick,
}: {
	integration: Integration
	connected: boolean
	onClick: () => void
}) {
	const comingSoon = integration.comingSoon

	const logoSrc =
		integration.logoSrc ?? getBrandfetchIcon(integration.logoDomain, { type: integration.logoType })

	if (comingSoon) {
		return (
			<div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-bg opacity-70">
				<div className="flex flex-1 flex-col gap-4 p-5">
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/8">
								<img
									src={logoSrc}
									alt={`${integration.name} logo`}
									className="size-10 object-contain"
								/>
							</div>
							<div className="flex flex-col gap-0.5">
								<h3 className="font-semibold text-fg text-sm">{integration.name}</h3>
								<ConnectionStatus connected={false} comingSoon />
							</div>
						</div>
					</div>
					<p className="text-muted-fg text-sm leading-relaxed">{integration.description}</p>
				</div>
				<div className="flex items-center justify-end border-border border-t bg-bg-muted/50 px-5 py-3">
					<svg
						className="size-4 text-muted-fg/50"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</div>
		)
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-bg text-left transition-all duration-200 hover:border-border-hover hover:shadow-md"
		>
			<div className="flex flex-1 flex-col gap-4 p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/8">
							<img
								src={logoSrc}
								alt={`${integration.name} logo`}
								className="size-10 object-contain"
							/>
						</div>
						<div className="flex flex-col gap-0.5">
							<h3 className="font-semibold text-fg text-sm">{integration.name}</h3>
							<ConnectionStatus connected={connected} />
						</div>
					</div>
				</div>
				<p className="text-muted-fg text-sm leading-relaxed">{integration.description}</p>
			</div>
			<div className="flex items-center justify-between border-border border-t bg-bg-muted/50 px-5 py-3">
				<span className="font-medium text-fg text-xs opacity-0 transition-opacity group-hover:opacity-100">
					Configure
				</span>
				<svg
					className="size-4 text-muted-fg transition-transform group-hover:translate-x-0.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</button>
	)
}

function ConnectionStatus({ connected, comingSoon }: { connected: boolean; comingSoon?: boolean }) {
	if (comingSoon) {
		return (
			<div className="flex items-center gap-1.5">
				<div className="size-1.5 rounded-full bg-warning" />
				<span className="text-warning text-xs">Coming soon</span>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-1.5">
			<div className={`size-1.5 rounded-full ${connected ? "bg-success" : "bg-secondary"}`} />
			<span className={`text-xs ${connected ? "text-success" : "text-muted-fg"}`}>
				{connected ? "Connected" : "Not connected"}
			</span>
		</div>
	)
}
