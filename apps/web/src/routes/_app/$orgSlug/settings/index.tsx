import { createFileRoute, Navigate, useParams } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/$orgSlug/settings/")({
	component: SettingsIndex,
})

function SettingsIndex() {
	const { orgSlug } = useParams({ from: "/_app/$orgSlug" })

	// Redirect to team settings as the default
	return <Navigate to="/$orgSlug/settings/team" params={{ orgSlug }} replace />
}
