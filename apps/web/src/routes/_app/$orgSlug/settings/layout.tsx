import { createFileRoute, Outlet, useLocation, useNavigate, useParams } from "@tanstack/react-router"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { Input, InputGroup } from "~/components/ui/input"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"

export const Route = createFileRoute("/_app/$orgSlug/settings")({
	component: RouteComponent,
})

const tabs = [
	{ id: "team", label: "Team" },
	{ id: "invitations", label: "Invitations" },
	{ id: "billing", label: "Billing" },
	{ id: "integrations", label: "Integrations" },
	// Only show debug tab in development
	...(!import.meta.env.PROD ? [{ id: "debug", label: "Debug" }] : []),
]

function RouteComponent() {
	const location = useLocation()
	const navigate = useNavigate()
	const { orgSlug } = useParams({ from: "/_app/$orgSlug" })

	// Extract the current tab from the pathname
	// No need for state - just derive from the URL directly
	const pathSegments = location.pathname.split("/")
	const selectedTab =
		pathSegments[pathSegments.length - 1] === "settings"
			? "team" // Default to team when at /_app/settings
			: pathSegments[pathSegments.length - 1]

	return (
		<main className="h-full w-full min-w-0 bg-bg">
			<div className="flex h-full min-h-0 w-full flex-col gap-8 overflow-y-auto pt-8 pb-12">
				<div className="flex flex-col gap-5 px-4 lg:px-8">
					{/* Page header simple with search */}
					<div className="relative flex flex-col gap-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
							<div className="flex flex-col gap-0.5 lg:gap-1">
								<h1 className="font-semibold text-fg text-xl lg:text-2xl">Server Settings</h1>
								<p className="text-muted-fg text-sm">Manage your workspace configuration</p>
							</div>
							<div className="flex flex-col gap-4 lg:flex-row">
								<InputGroup className="lg:w-80">
									<IconMagnifier data-slot="icon" />
									<Input aria-label="Search" placeholder="Search" />
								</InputGroup>
							</div>
						</div>
					</div>

					{/* Mobile select dropdown */}
					<div className="md:hidden">
						<select
							value={selectedTab}
							onChange={(event) => {
								const tabId = event.target.value
								navigate({
									to:
										tabId === "team"
											? "/$orgSlug/settings"
											: `/$orgSlug/settings/${tabId}`,
									params: { orgSlug },
								})
							}}
							className="w-full appearance-none rounded-lg border border-input bg-bg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-fg outline-hidden focus:border-ring/70 focus:ring-3 focus:ring-ring/20 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6"
						>
							{tabs.map((tab) => (
								<option key={tab.id} value={tab.id}>
									{tab.label}
								</option>
							))}
						</select>
					</div>

					{/* Desktop tabs */}
					<div className="scrollbar-hide -mx-4 -my-1 flex w-full max-w-full overflow-x-auto px-4 py-1 lg:-mx-8 lg:px-8">
						<Tabs
							className="max-md:hidden"
							selectedKey={selectedTab}
							onSelectionChange={(value) => {
								const tabId = value as string
								navigate({
									to:
										tabId === "team"
											? "/$orgSlug/settings"
											: `/$orgSlug/settings/${tabId}`,
									params: { orgSlug },
								})
							}}
						>
							<TabList className="w-full">
								{tabs.map((tab) => (
									<Tab key={tab.id} id={tab.id}>
										{tab.label}
									</Tab>
								))}
							</TabList>
						</Tabs>
					</div>
				</div>
				<Outlet />
			</div>
		</main>
	)
}
