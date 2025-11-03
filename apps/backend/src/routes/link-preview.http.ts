import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import metascraper from "metascraper"
import metascraperDescription from "metascraper-description"
import metascraperImage from "metascraper-image"
import metascraperLogo from "metascraper-logo"
import metascraperPublisher from "metascraper-publisher"
import metascraperTitle from "metascraper-title"
import metascraperUrl from "metascraper-url"
import { HazelApi, LinkPreviewError } from "../api"

// Initialize metascraper with plugins
const scraper = metascraper([
	metascraperUrl(),
	metascraperTitle(),
	metascraperDescription(),
	metascraperImage(),
	metascraperLogo(),
	metascraperPublisher(),
])

export const HttpLinkPreviewLive = HttpApiBuilder.group(HazelApi, "linkPreview", (handlers) =>
	handlers.handle(
		"get",
		Effect.fn(function* ({ urlParams }) {
			const targetUrl = urlParams.url

			yield* Effect.log(`Fetching link preview for: ${targetUrl}`)

			// Fetch the HTML content using native fetch
			const html = yield* Effect.tryPromise({
				try: async () => {
					const response = await fetch(targetUrl, {
						headers: {
							"User-Agent":
								"Mozilla/5.0 (compatible; HazelBot/1.0; +https://hazel.chat/bot)",
						},
						signal: AbortSignal.timeout(10000),
					})

					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`)
					}

					return await response.text()
				},
				catch: (error) =>
					new LinkPreviewError({
						message: `Failed to fetch URL: ${error}`,
					}),
			})

			// Extract metadata using metascraper
			const metadata = yield* Effect.tryPromise({
				try: () => scraper({ html, url: targetUrl }),
				catch: (error) =>
					new LinkPreviewError({
						message: `Failed to extract metadata: ${error}`,
					}),
			})

			yield* Effect.log(`Successfully extracted metadata for: ${targetUrl}`)

			// Transform to match the frontend schema, converting null to undefined
			return {
				url: metadata.url ?? undefined,
				title: metadata.title ?? undefined,
				description: metadata.description ?? undefined,
				image: metadata.image ? { url: metadata.image } : undefined,
				logo: metadata.logo ? { url: metadata.logo } : undefined,
				publisher: metadata.publisher ?? undefined,
			}
		}),
	),
)
