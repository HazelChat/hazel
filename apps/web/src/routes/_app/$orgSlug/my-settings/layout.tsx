import { createFileRoute, Outlet, useLocation, useNavigate, useParams } from "@tanstack/react-router"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"

export const Route = createFileRoute("/_app/$orgSlug/my-settings")({
	component: RouteComponent,
})

const tabs = [
	{ id: "appearance", label: "Appearance" },
	{ id: "profile", label: "Profile" },
	{ id: "notifications", label: "Notifications" },
]

function RouteComponent() {
	const location = useLocation()
	const navigate = useNavigate()
	const { orgSlug } = useParams({ from: "/_app/$orgSlug" })

	// Extract the current tab from the pathname
	const pathSegments = location.pathname.split("/")
	const selectedTab =
		pathSegments[pathSegments.length - 1] === "my-settings"
			? "appearance" // Default to appearance when at /_app/my-settings
			: pathSegments[pathSegments.length - 1]

	return (
		<main className="h-full w-full min-w-0 bg-bg">
			<div className="flex h-full min-h-0 w-full flex-col gap-8 overflow-y-auto pt-8 pb-12">
				<div className="flex flex-col gap-5 px-4 lg:px-8">
					{/* Page header */}
					<div className="relative flex flex-col gap-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
							<div className="flex flex-col gap-0.5 lg:gap-1">
								<h1 className="font-semibold text-fg text-xl lg:text-2xl">My Settings</h1>
								<p className="text-muted-fg text-sm">Customize your personal experience</p>
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
										tabId === "appearance"
											? "/$orgSlug/my-settings"
											: `/$orgSlug/my-settings/${tabId}`,
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
										tabId === "appearance"
											? "/$orgSlug/my-settings"
											: `/$orgSlug/my-settings/${tabId}`,
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
