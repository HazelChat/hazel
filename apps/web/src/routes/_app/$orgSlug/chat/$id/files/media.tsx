import type { ChannelId } from "@hazel/schema"
import { IconArrowLeft } from "~/components/icons/icon-arrow-left"
import { createFileRoute, Link } from "@tanstack/react-router"
import { MediaGalleryView } from "~/components/chat/channel-files/channel-files-media-gallery-view"
import { Button } from "~/components/ui/button"

export const Route = createFileRoute("/_app/$orgSlug/chat/$id/files/media")({
	component: MediaGalleryRoute,
})

function MediaGalleryRoute() {
	const { id, orgSlug } = Route.useParams()

	return (
		<div className="flex h-full flex-col">
			{/* Header with back button */}
			<header className="flex shrink-0 items-center gap-3 border-border border-b px-4 py-3">
				<Link to="/$orgSlug/chat/$id/files" params={{ orgSlug, id }}>
					<Button intent="plain" size="sq-sm" aria-label="Go back">
						<IconArrowLeft className="size-5" />
					</Button>
				</Link>
				<h1 className="font-semibold text-lg">All Media</h1>
			</header>

			{/* Gallery content */}
			<MediaGalleryView channelId={id as ChannelId} />
		</div>
	)
}
