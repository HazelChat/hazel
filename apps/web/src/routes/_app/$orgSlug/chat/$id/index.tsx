import type { ChannelId } from "@hazel/schema"
import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense, useEffect } from "react"
import { ChannelJoinBanner, useIsChannelMember } from "~/components/chat/channel-join-banner"
import { MessageList } from "~/components/chat/message-list"
import { TypingIndicator } from "~/components/chat/typing-indicator"

// Lazy load the Slate composer (~30-40KB savings)
const SlateMessageComposer = lazy(() =>
	import("~/components/chat/slate-editor/slate-message-composer").then((m) => ({
		default: m.SlateMessageComposer,
	})),
)

// Minimal skeleton for composer while loading
function ComposerSkeleton() {
	return (
		<div className="rounded-lg border border-border bg-secondary/30 p-3">
			<div className="h-10 w-full animate-pulse rounded bg-muted" />
		</div>
	)
}

export const Route = createFileRoute("/_app/$orgSlug/chat/$id/")({
	component: MessagesRoute,
})

function MessagesRoute() {
	const { messageId } = Route.useSearch()
	const { id } = Route.useParams()
	const navigate = Route.useNavigate()
	const isMember = useIsChannelMember(id as ChannelId)

	// TODO: Implement scroll-to-message - see GitHub issue
	// Clear messageId from URL when present (scroll functionality not yet implemented)
	useEffect(() => {
		if (messageId) {
			navigate({ search: {}, replace: true })
		}
	}, [messageId, navigate])

	if (!isMember) {
		return <ChannelJoinBanner channelId={id as ChannelId} />
	}

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<MessageList />
			</div>
			<div className="shrink-0 px-4 pt-2.5">
				<Suspense fallback={<ComposerSkeleton />}>
					<SlateMessageComposer />
				</Suspense>
				<TypingIndicator />
			</div>
		</>
	)
}
