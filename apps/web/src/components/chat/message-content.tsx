import type { OrganizationId } from "@hazel/schema"
import { createContext, lazy, Suspense, useMemo } from "react"
import { Node } from "slate"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { GifEmbed } from "~/components/gif-embed"
import {
	extractGitHubInfo,
	extractLinearIssueKey,
	extractTweetId,
	extractUrls,
	extractYoutubeVideoId,
	isGifUrl,
	isGitHubPRUrl,
	isLinearIssueUrl,
	isTweetUrl,
	isYoutubeUrl,
	LinkPreview,
} from "~/components/link-preview"
import { YoutubeEmbed } from "~/components/youtube-embed"
import { MessageEmbeds } from "./message-embeds"
import {
	deserializeFromMarkdown,
	type CustomDescendant,
	type CustomElement,
} from "./slate-editor/slate-markdown-serializer"
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
	gifUrls: string[]
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

/**
 * Extract URLs only from paragraph elements (skip code blocks, tables, blockquotes, etc.)
 * This ensures we don't create embeds for URLs that are part of code or data.
 */
function extractUrlsFromParagraphs(content: string): string[] {
	const value = deserializeFromMarkdown(content)
	const urls: string[] = []

	for (const node of value) {
		if ("type" in node) {
			const element = node as CustomElement
			if (element.type === "paragraph") {
				const text = Node.string(element)
				urls.push(...extractUrls(text))
			}
		}
	}
	return [...new Set(urls)] // dedupe
}

/**
 * Determine if a message is a "link share" style message.
 * A link share is a short message where the URL is the focus,
 * not a URL mentioned within longer content.
 *
 * @param content - The message content
 * @param paragraphUrls - URLs extracted from paragraph elements only
 * @returns true if the message should show auto-embeds
 */
function isLinkShareMessage(content: string, paragraphUrls: string[]): boolean {
	if (paragraphUrls.length === 0) return false

	// Remove URLs from content to measure actual text
	let textOnly = content
	for (const url of paragraphUrls) {
		textOnly = textOnly.replaceAll(url, "")
	}
	// Normalize whitespace and trim
	textOnly = textOnly.replace(/\s+/g, " ").trim()

	// Link share = short accompanying text (under 300 chars)
	return textOnly.length < 300
}

interface MessageContentProviderProps {
	message: MessageWithPinned
	organizationId: OrganizationId | undefined
	children: React.ReactNode
}

function MessageContentProvider({ message, organizationId, children }: MessageContentProviderProps) {
	const processedUrls = useMemo((): ProcessedUrls => {
		// 1. Extract URLs only from paragraphs (not tables, code blocks, blockquotes, etc.)
		const paragraphUrls = extractUrlsFromParagraphs(message.content)

		// 2. Collect URLs already represented in rich embeds (from tool calls/webhooks)
		const existingEmbedUrls = new Set<string>()
		const existingLinearKeys = new Set<string>()
		const existingGitHubPRs = new Set<string>()

		message.embeds?.forEach((embed) => {
			// Collect direct URLs from embeds
			if (embed.url) {
				existingEmbedUrls.add(embed.url)
				// Extract resource IDs for deeper deduplication
				const linearKey = extractLinearIssueKey(embed.url)
				if (linearKey) existingLinearKeys.add(linearKey)
				const ghInfo = extractGitHubInfo(embed.url)
				if (ghInfo) existingGitHubPRs.add(`${ghInfo.owner}/${ghInfo.repo}/${ghInfo.number}`)
			}
			// Also check author URL (some embeds link author to resource)
			if (embed.author?.url) {
				existingEmbedUrls.add(embed.author.url)
				const linearKey = extractLinearIssueKey(embed.author.url)
				if (linearKey) existingLinearKeys.add(linearKey)
				const ghInfo = extractGitHubInfo(embed.author.url)
				if (ghInfo) existingGitHubPRs.add(`${ghInfo.owner}/${ghInfo.repo}/${ghInfo.number}`)
			}
		})

		// 3. Only show embeds if this is a "link share" message (short, URL-focused)
		const shouldShowEmbeds = isLinkShareMessage(message.content, paragraphUrls)

		if (!shouldShowEmbeds) {
			return {
				tweetUrls: [],
				youtubeUrls: [],
				linearUrls: [],
				githubPRUrls: [],
				gifUrls: [],
				otherUrls: [],
				displayContent: message.content,
			}
		}

		// 4. Filter out URLs that are already represented in rich embeds
		const uniqueUrls = paragraphUrls.filter((url) => !existingEmbedUrls.has(url))

		// 5. Categorize URLs and dedupe by resource ID
		const tweetUrls = uniqueUrls.filter((url) => isTweetUrl(url))
		const youtubeUrls = uniqueUrls.filter((url) => isYoutubeUrl(url))
		const gifUrls = uniqueUrls.filter((url) => isGifUrl(url))
		const linearUrls = uniqueUrls.filter((url) => {
			if (!isLinearIssueUrl(url)) return false
			const key = extractLinearIssueKey(url)
			// Exclude if this Linear issue is already shown in an embed
			return key && !existingLinearKeys.has(key)
		})
		const githubPRUrls = uniqueUrls.filter((url) => {
			if (!isGitHubPRUrl(url)) return false
			const info = extractGitHubInfo(url)
			// Exclude if this GitHub PR is already shown in an embed
			return info && !existingGitHubPRs.has(`${info.owner}/${info.repo}/${info.number}`)
		})
		const otherUrls = uniqueUrls.filter(
			(url) =>
				!isTweetUrl(url) &&
				!isYoutubeUrl(url) &&
				!isGifUrl(url) &&
				!isLinearIssueUrl(url) &&
				!isGitHubPRUrl(url),
		)

		// 6. Filter out embed URLs from displayed content
		const embedUrls = [...tweetUrls, ...youtubeUrls, ...gifUrls, ...linearUrls, ...githubPRUrls]
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
			gifUrls,
			otherUrls,
			displayContent,
		}
	}, [message.content, message.embeds])

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
	const { message, processedUrls, organizationId } = useMessageContent()

	// Don't render static text if message has live state (live state handles text display)
	const hasLiveState = message.embeds?.some((embed) => embed.liveState?.enabled === true)
	if (hasLiveState) {
		return null
	}

	if (!processedUrls.displayContent) {
		return null
	}

	return <SlateMessageViewer content={processedUrls.displayContent} organizationId={organizationId} />
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

			{/* Render all GIF embeds */}
			{processedUrls.gifUrls.map((url) => (
				<GifEmbed
					key={url}
					url={url}
					author={message.author ?? undefined}
					createdAt={message.createdAt.getTime()}
				/>
			))}

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
			<MessageEmbeds embeds={message.embeds} messageId={message.id} organizationId={organizationId} />
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
