import { createFileRoute, notFound } from "@tanstack/react-router"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { createServerFn } from "@tanstack/react-start"
import { source } from "@/lib/source"
import browserCollections from "fumadocs-mdx:collections/browser"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { baseOptions } from "@/lib/layout.shared"
import { useFumadocsLoader } from "fumadocs-core/source/client"
import { Tabs, Tab } from "fumadocs-ui/components/tabs"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { File, Folder, Files } from "fumadocs-ui/components/files"
import { TypeTable } from "fumadocs-ui/components/type-table"
import { Accordion, Accordions } from "fumadocs-ui/components/accordion"
import { ImageZoom } from "fumadocs-ui/components/image-zoom"

export const Route = createFileRoute("/$")({
	component: Page,
	loader: async ({ params }) => {
		const slugs = params._splat?.split("/") ?? []
		const data = await serverLoader({ data: slugs })
		await clientLoader.preload(data.path)
		return data
	},
})

const serverLoader = createServerFn({
	method: "GET",
})
	.inputValidator((slugs: string[]) => slugs)
	.handler(async ({ data: slugs }) => {
		const page = source.getPage(slugs)
		if (!page) throw notFound()

		return {
			path: page.path,
			pageTree: await source.serializePageTree(source.getPageTree()),
		}
	})

const clientLoader = browserCollections.docs.createClientLoader({
	component({ toc, frontmatter, default: MDX }) {
		return (
			<DocsPage toc={toc}>
				<DocsTitle>{frontmatter.title}</DocsTitle>
				<DocsDescription>{frontmatter.description}</DocsDescription>
				<DocsBody>
					<MDX
						components={{
							...defaultMdxComponents,
							Tabs,
							Tab,
							Step,
							Steps,
							File,
							Folder,
							Files,
							TypeTable,
							Accordion,
							Accordions,
							img: (props) => <ImageZoom {...props} />,
						}}
					/>
				</DocsBody>
			</DocsPage>
		)
	},
})

function Page() {
	const data = Route.useLoaderData()
	const { pageTree } = useFumadocsLoader(data)
	const Content = clientLoader.getComponent(data.path)

	return (
		<DocsLayout {...baseOptions()} tree={pageTree} githubUrl="https://github.com/hazelchat/hazel">
			<Content />
		</DocsLayout>
	)
}
