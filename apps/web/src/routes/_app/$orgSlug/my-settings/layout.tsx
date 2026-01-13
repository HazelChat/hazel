import { createFileRoute, Outlet, useMatchRoute, useNavigate, useParams } from "@tanstack/react-router"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"
import { isTauri } from "~/lib/tauri"

export const Route = createFileRoute("/_app/$orgSlug/my-settings")({
	component: RouteComponent,
})

const allTabs = [
	{ id: "appearance", label: "Appearance", to: "/$orgSlug/my-settings" as const },
	{ id: "profile", label: "Profile", to: "/$orgSlug/my-settings/profile" as const },
	{ id: "notifications", label: "Notifications", to: "/$orgSlug/my-settings/notifications" as const },
	{ id: "desktop", label: "Desktop", to: "/$orgSlug/my-settings/desktop" as const, desktopOnly: true },
]

function RouteComponent() {
	const matchRoute = useMatchRoute()
	const navigate = useNavigate()
	const { orgSlug } = useParams({ from: "/_app/$orgSlug" })

	const tabs = allTabs.filter((tab) => !("desktopOnly" in tab) || isTauri())

	const selectedTab =
		[...tabs].find((tab) =>
			matchRoute({
				to: tab.to,
				params: { orgSlug },
			}),
		)?.id ?? "appearance"

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
								const tab = tabs.find((t) => t.id === tabId)
								if (tab) {
									navigate({ to: tab.to, params: { orgSlug } })
								}
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
								const tab = tabs.find((t) => t.id === tabId)
								if (tab) {
									navigate({ to: tab.to, params: { orgSlug } })
								}
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
