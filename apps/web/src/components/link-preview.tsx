"use client"

import { Atom, Result, useAtomValue } from "@effect-atom/atom-react"
import type { LinkPreviewData } from "@hazel/backend/api"
import { Effect } from "effect"
import { useMemo } from "react"
import { ApiClient } from "~/lib/services/common/api-client"

// Atom family for per-URL caching using typesafe API client
const linkPreviewAtomFamily = Atom.family((url: string) =>
	Atom.make(
		Effect.gen(function* () {
			const client = yield* ApiClient
			const data = yield* client.linkPreview.get({ urlParams: { url } })
			return data
		}).pipe(
			Effect.provide(ApiClient.Default),
			Effect.tapError((error) =>
				Effect.sync(() => {
					console.error("Link preview fetch error:", error)
				}),
			),
			Effect.catchAll(() => Effect.succeed(null as LinkPreviewData | null)),
		),
	).pipe(Atom.setIdleTTL("10 minutes")),
)

export function LinkPreview({ url }: { url: string }) {
	const previewResult = useAtomValue(linkPreviewAtomFamily(url))
	const og = Result.getOrElse(previewResult, () => null)
	const isLoading = Result.isInitial(previewResult)

	const host = useMemo(() => {
		try {
			return new URL(og?.url || url).host
		} catch {
			return ""
		}
	}, [og, url])

	// Don't render anything if failed and no data
	if (!og && !isLoading) return null

	return (
		<a
			href={og?.url || url}
			target="_blank"
			rel="noopener noreferrer"
			className="mt-2 block max-w-sm overflow-hidden rounded-lg border pressed:border-fg/15 bg-muted/40 pressed:bg-muted hover:border-fg/15 hover:bg-muted"
		>
			{og?.image?.url && (
				<div className="aspect-video w-full overflow-hidden bg-muted">
					<img src={og.image.url} alt="" className="h-full w-full object-cover" />
				</div>
			)}
			<div className="flex items-start border-t p-3">
				<div className="min-w-0">
					<div className="truncate font-semibold text-sm">{og?.title || host || url}</div>
					{og?.description && (
						<div className="mt-0.5 line-clamp-2 text-[12px] text-fg/70">{og.description}</div>
					)}
					<div className="mt-1 text-[11px] text-primary-subtle-fg">{host}</div>
				</div>
			</div>
			{isLoading && <div className="px-3 pb-3 text-[11px] text-muted-fg">Loading preview…</div>}
		</a>
	)
}

export function extractUrls(input: string): string[] {
	const re =
		/(https?:\/\/[^\s)]+|www\.[^\s)]+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s)]*)?)/gi
	const found: string[] = []
	let m: RegExpExecArray | null
	// biome-ignore lint/suspicious/noAssignInExpressions: ...
	while ((m = re.exec(input))) {
		const raw = stripTrailingPunct(m[0])
		const href = normalizeUrl(raw)
		if (!found.includes(href)) found.push(href)
	}
	return found
}

function stripTrailingPunct(v: string): string {
	return v.replace(/[),.;!?]+$/g, "")
}

export function normalizeUrl(value: string): string {
	const v = value.trim()
	if (/^https?:\/\//i.test(v)) return v
	if (/^www\./i.test(v)) return `https://${v}`
	return `https://${v}`
}

export function isTweetUrl(url: string): boolean {
	try {
		const parsed = new URL(url)
		const isTwitterDomain =
			parsed.hostname === "twitter.com" ||
			parsed.hostname === "www.twitter.com" ||
			parsed.hostname === "x.com" ||
			parsed.hostname === "www.x.com"
		const hasStatusPath = /\/status\/\d+/.test(parsed.pathname)
		return isTwitterDomain && hasStatusPath
	} catch {
		return false
	}
}

export function extractTweetId(url: string): string | null {
	try {
		const parsed = new URL(url)
		const match = parsed.pathname.match(/\/status\/(\d+)/)
		return match?.[1] ?? null
	} catch {
		return null
	}
}
