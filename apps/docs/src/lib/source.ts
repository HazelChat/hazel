import { loader, type InferPageType } from "fumadocs-core/source"
import { docs } from "fumadocs-mdx:collections/server"
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons"

export const source = loader({
	source: docs.toFumadocsSource(),
	baseUrl: "/",
	plugins: [lucideIconsPlugin()],
})

export function getPageImage(page: InferPageType<typeof source>) {
	const segments = [...page.slugs, "og.png"]
	return {
		segments,
		url: `/og/${segments.join("/")}`,
	}
}
