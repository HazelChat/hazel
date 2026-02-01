import type { OrganizationId } from "@hazel/schema"
import { createContext, lazy, Suspense, useMemo } from "react"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import {
	extractGitHubInfo,
	extractLinearIssueKey,
	extractTweetId,
	extractUrls,
	extractYoutubeVideoId,
	isGitHubPRUrl,
	isLinearIssueUrl,
	isTweetUrl,
	isYoutubeUrl,
	LinkPreview,
} from "~/components/link-preview"
import { YoutubeEmbed } from "~/components/youtube-embed"
import { MessageEmbeds } from "./message-embeds"
import { SlateMessageViewer } from "./slate-editor/slate-message-viewer"

// Lazy load heavy embed components (~85KB combined savings)
const TweetEmbed = lazy(() => import("~/components/tweet-embed").then((m) => ({ default: m.TweetEmbed })))
const GitHubPREmbed = lazy(() =>
	import("~/components/integrations/github-pr-embed").then((m) => ({ default: m.GitHubPREmbed })),
)
const LinearIssueEmbed = lazy(() =>
	import("~/components/integrations/linear-issue-embed").then((m) => ({
		default: m.LinearIssueEmbed,
	})),
)

// Skeleton placeholder for lazy-loaded embeds
function EmbedSkeleton() {
	return (
		<div className="mt-2 flex max-w-sm flex-col gap-2 rounded-lg border border-fg/15 bg-muted/40 p-4">
			<div className="flex flex-row gap-2">
				<div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
				<div className="h-10 w-full animate-pulse rounded bg-muted" />
			</div>
			<div className="h-20 w-full animate-pulse rounded bg-muted" />
		</div>
	)
}

interface ProcessedUrls {
	tweetUrls: string[]
	youtubeUrls: string[]
	linearUrls: string[]
	githubPRUrls: string[]
	otherUrls: string[]
	displayContent: string
}

interface MessageContentContextValue {
	message: MessageWithPinned
	processedUrls: ProcessedUrls
	organizationId: OrganizationId | undefined
}

const MessageContentContext = createContext<MessageContentContextValue | null>(null)

function useMessageContent() {
	const context = React.use(MessageContentContext)
	if (!context) {
		throw new Error("MessageContent compound components must be used within MessageContent.Provider")
	}
	return context
}

import React from "react"

interface MessageContentProviderProps {
	message: MessageWithPinned
	organizationId: OrganizationId | undefined
	children: React.ReactNode
}

function MessageContentProvider({ message, organizationId, children }: MessageContentProviderProps) {
	const processedUrls = useMemo((): ProcessedUrls => {
		const urls = extractUrls(message.content)
		const tweetUrls = urls.filter((url) => isTweetUrl(url))
		const youtubeUrls = urls.filter((url) => isYoutubeUrl(url))
		const linearUrls = urls.filter((url) => isLinearIssueUrl(url))
		const githubPRUrls = urls.filter((url) => isGitHubPRUrl(url))
		const otherUrls = urls.filter(
			(url) => !isTweetUrl(url) && !isYoutubeUrl(url) && !isLinearIssueUrl(url) && !isGitHubPRUrl(url),
		)

		// Filter out embed URLs from displayed content
		const embedUrls = [...tweetUrls, ...youtubeUrls, ...linearUrls, ...githubPRUrls]
		let displayContent = message.content
		for (const url of embedUrls) {
			displayContent = displayContent.replace(url, "")
		}
		displayContent = displayContent.trim()

		return {
			tweetUrls,
			youtubeUrls,
			linearUrls,
			githubPRUrls,
			otherUrls,
			displayContent,
		}
	}, [message.content])

	const contextValue = useMemo(
		(): MessageContentContextValue => ({
			message,
			processedUrls,
			organizationId,
		}),
		[message, processedUrls, organizationId],
	)

	return <MessageContentContext value={contextValue}>{children}</MessageContentContext>
}

/**
 * Renders the message text with embed URLs filtered out
 */
function MessageText() {
	const { message, processedUrls } = useMessageContent()

	// Don't render static text if message has live state (live state handles text display)
	const hasLiveState = message.embeds?.some((embed) => embed.liveState?.enabled === true)
	if (hasLiveState) {
		return null
	}

	if (!processedUrls.displayContent) {
		return null
	}

	return <SlateMessageViewer content={processedUrls.displayContent} />
}

/**
 * Renders all embeds: tweets, YouTube, Linear, GitHub, link previews, and webhook embeds
 */
function Embeds() {
	const { message, processedUrls, organizationId } = useMessageContent()

	return (
		<>
			{/* Render all tweet embeds */}
			{processedUrls.tweetUrls.map((url) => {
				const tweetId = extractTweetId(url)
				return tweetId ? (
					<Suspense key={url} fallback={<EmbedSkeleton />}>
						<TweetEmbed
							id={tweetId}
							author={message.author ?? undefined}
							messageCreatedAt={message.createdAt.getTime()}
						/>
					</Suspense>
				) : null
			})}

			{/* Render all YouTube embeds */}
			{processedUrls.youtubeUrls.map((url) => {
				const videoId = extractYoutubeVideoId(url)
				return videoId ? <YoutubeEmbed key={url} videoId={videoId} url={url} /> : null
			})}

			{/* Render all Linear issue embeds */}
			{processedUrls.linearUrls.map((url) => {
				const issueKey = extractLinearIssueKey(url)
				return issueKey && organizationId ? (
					<Suspense key={url} fallback={<EmbedSkeleton />}>
						<LinearIssueEmbed url={url} orgId={organizationId} />
					</Suspense>
				) : null
			})}

			{/* Render all GitHub PR embeds */}
			{processedUrls.githubPRUrls.map((url) => {
				const info = extractGitHubInfo(url)
				return info && organizationId ? (
					<Suspense key={url} fallback={<EmbedSkeleton />}>
						<GitHubPREmbed url={url} orgId={organizationId} />
					</Suspense>
				) : null
			})}

			{/* Render last other URL as link preview */}
			{processedUrls.otherUrls.length > 0 &&
				processedUrls.otherUrls[processedUrls.otherUrls.length - 1] && (
					<LinkPreview url={processedUrls.otherUrls[processedUrls.otherUrls.length - 1]!} />
				)}

			{/* Webhook/rich embeds */}
			<MessageEmbeds embeds={message.embeds} messageId={message.id} />
		</>
	)
}

/**
 * Compound component for rendering message content with embeds.
 *
 * This component processes URLs once and makes the processed data available
 * to sub-components via context, avoiding duplicate processing.
 *
 * @example
 * ```tsx
 * <MessageContent.Provider message={message} organizationId={orgId}>
 *   <MessageContent.Text />
 *   <MessageContent.Embeds />
 * </MessageContent.Provider>
 * ```
 */
export const MessageContent = {
	Provider: MessageContentProvider,
	Text: MessageText,
	Embeds,
}
