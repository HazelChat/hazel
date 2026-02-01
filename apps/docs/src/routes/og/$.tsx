import { createFileRoute, notFound } from "@tanstack/react-router"
import { source } from "@/lib/source"
import { ImageResponse } from "@vercel/og"

export const Route = createFileRoute("/og/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const slugParts = params._splat?.split("/") ?? []
				// Remove the trailing "og.png" from the slug
				const slugs = slugParts.slice(0, -1)
				const page = source.getPage(slugs)
				if (!page) throw notFound()

				const title = page.data.title ?? "Hazel Docs"
				const description = page.data.description ?? ""

				return new ImageResponse(
					<div
						tw="flex flex-col w-full h-full bg-zinc-950 text-white p-16"
						style={{ fontFamily: "Geist" }}
					>
						<div tw="flex flex-col flex-1 justify-center">
							<div tw="flex items-center mb-6">
								<div tw="flex items-center justify-center w-12 h-12 bg-violet-600 rounded-lg mr-4">
									<svg
										width="28"
										height="28"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
									</svg>
								</div>
								<span tw="text-zinc-400 text-2xl">Hazel Docs</span>
							</div>
							<h1 tw="text-6xl font-bold text-white mb-4 leading-tight">{title}</h1>
							{description && (
								<p tw="text-2xl text-zinc-400 leading-relaxed max-w-3xl">{description}</p>
							)}
						</div>
						<div tw="flex items-center justify-between border-t border-zinc-800 pt-6">
							<span tw="text-zinc-500 text-xl">docs.hazel.chat</span>
						</div>
					</div>,
					{
						width: 1200,
						height: 630,
					},
				)
			},
		},
	},
	preload: false,
})
