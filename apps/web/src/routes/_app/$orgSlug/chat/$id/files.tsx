import type { ChannelId } from "@hazel/schema"
import { createFileRoute } from "@tanstack/react-router"
import { ChannelFilesView } from "~/components/chat/channel-files"

export const Route = createFileRoute("/_app/$orgSlug/chat/$id/files")({
	component: FilesRoute,
})

function FilesRoute() {
	const { id } = Route.useParams()

	return <ChannelFilesView channelId={id as ChannelId} />
}
