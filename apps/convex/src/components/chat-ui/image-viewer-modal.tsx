import { Format } from "@ark-ui/solid"
import { type Accessor, For, Index, Show, createEffect, createSignal } from "solid-js"

import { IconCopy } from "~/components/icons/copy"
import { IconDownload } from "~/components/icons/download"
import { IconLink } from "~/components/icons/link"
import { IconOpenLink } from "~/components/icons/open-link"
import { IconCircleXSolid } from "~/components/icons/solid/circle-x-solid"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { toaster } from "~/components/ui/toaster"
import { Tooltip } from "~/components/ui/tooltip"

import { Portal } from "solid-js/web"
import { Dialog, DialogBackdrop } from "../ui/dialog"

import { Dialog as ArkDialog } from "@ark-ui/solid"
import type { Doc } from "convex-hazel/_generated/dataModel"
import { twMerge } from "tailwind-merge"
import { Carousel } from "../ui/carousel"

interface ImageViewerModalProps {
	defaultImage: Accessor<string>
	availableImages: Accessor<string[]>
	onOpenChange: (open: boolean) => void
	author: Doc<"users">
	createdAt: number
	bucketUrl: string
}

export function ImageViewerModal(props: ImageViewerModalProps) {
	const [selectedImage, setSelectedImage] = createSignal<string>(props.defaultImage())

	const imageModalActions = [
		{
			label: "Download",
			icon: <IconDownload />,
			onClick: async (e: MouseEvent) => {
				e.stopPropagation()
				const imageUrl = selectedImage()?.startsWith("https")
					? selectedImage()!
					: `${props.bucketUrl}/${selectedImage()}`
				try {
					const response = await fetch(imageUrl)
					const blob = await response.blob()
					const url = URL.createObjectURL(blob)
					const a = document.createElement("a")
					a.href = url
					a.download = selectedImage()!
					a.click()
					URL.revokeObjectURL(url)
				} catch (error) {
					console.error("Failed to download image:", error)
				}

				toaster.create({
					title: "Image downloaded",
					description: "Your image has been downloaded.",
					type: "success",
				})
			},
		},
		{
			label: "Copy Image",
			icon: <IconCopy />,
			onClick: async (e: MouseEvent) => {
				e.stopPropagation()
				const imageUrl = selectedImage()?.startsWith("https")
					? selectedImage()!
					: `${props.bucketUrl}/${selectedImage()}`
				try {
					const response = await fetch(imageUrl)
					const blob = await response.blob()
					await navigator.clipboard.write([
						new ClipboardItem({
							[blob.type]: blob,
						}),
					])
				} catch (error) {
					console.error("Failed to copy image:", error)
				}

				toaster.create({ title: "Image copied", description: "Your image has been copied.", type: "success" })
			},
		},
		{
			label: "Copy Image URL",
			icon: <IconLink />,
			onClick: (e: MouseEvent) => {
				e.stopPropagation()
				navigator.clipboard.writeText(`${props.bucketUrl}/${selectedImage()}`)

				toaster.create({
					title: "Image URL copied",
					description: "Your image URL has been copied.",
					type: "success",
				})
			},
		},
		{
			label: "Open in Browser",
			icon: <IconOpenLink />,
			onClick: (e: MouseEvent) => {
				e.stopPropagation()
				window.open(`${props.bucketUrl}/${selectedImage()}`, "_blank")
			},
		},
		{
			label: "Close",
			icon: <IconCircleXSolid />,
			onClick: (e: MouseEvent) => {
				e.stopPropagation()
				props.onOpenChange(false)
			},
		},
	]

	return (
		<Dialog open={!!selectedImage()} onOpenChange={(details) => props.onOpenChange(details.open)}>
			<Portal>
				<DialogBackdrop class="bg-black/90" />
				<ArkDialog.Positioner>
					<ArkDialog.Content
						class={twMerge(
							"fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ease-in-out",
						)}
						onClick={(e) => {
							if (e.target !== e.currentTarget) return
							props.onOpenChange(false)
						}}
					>
						<div class="absolute top-3 left-5 flex items-center gap-2">
							<Avatar src={props.author?.avatarUrl} name={props.author?.displayName!} />
							<div class="flex flex-col">
								<span class="text-sm">{props.author?.displayName}</span>

								<span class="text-muted-foreground text-xs">
									<Format.RelativeTime value={new Date(props.createdAt)} />
								</span>
							</div>
						</div>
						<Show
							when={props.availableImages().length > 1}
							fallback={
								<img
									src={
										selectedImage()?.startsWith("https")
											? selectedImage()!
											: `${props.bucketUrl}/${selectedImage()}`
									}
									alt={selectedImage()!}
									class="max-h-[90vh] max-w-[90vw] rounded-md"
								/>
							}
						>
							<Carousel
								class="mx-36"
								loop
								slideCount={props.availableImages().length}
								page={props.availableImages().indexOf(selectedImage())}
								onPageChange={(details) => setSelectedImage(props.availableImages()[details.page])}
								onClick={(e) => {
									if ((e.target as HTMLElement).tagName.toLowerCase() === "div") {
										props.onOpenChange(false)
									}
								}}
							>
								<Carousel.ItemGroup>
									<Index each={props.availableImages()}>
										{(image, index) => (
											<Carousel.Item index={index}>
												{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
												<img
													src={
														image()?.startsWith("https")
															? image()!
															: `${props.bucketUrl}/${image()}`
													}
													alt={`Slide ${index}`}
													class="max-h-[70vh] max-w-[90vw] rounded-md"
													onClick={(e) => e.stopPropagation()}
												/>
											</Carousel.Item>
										)}
									</Index>
								</Carousel.ItemGroup>
								<Carousel.Control>
									<Carousel.PrevTrigger />
									<Carousel.NextTrigger />
								</Carousel.Control>
								<Carousel.IndicatorGroup>
									<Index each={props.availableImages()}>
										{(_, index) => <Carousel.Indicator index={index} />}
									</Index>
								</Carousel.IndicatorGroup>
							</Carousel>
						</Show>

						<div class="absolute top-3 right-5 rounded-md border bg-sidebar">
							<For each={imageModalActions}>
								{(action) => (
									<Tooltip openDelay={0} closeDelay={0}>
										<Tooltip.Trigger>
											<Button intent="ghost" size="square" onClick={(e) => action.onClick(e)}>
												{action.icon}
											</Button>
										</Tooltip.Trigger>
										<Tooltip.Content>{action.label}</Tooltip.Content>
									</Tooltip>
								)}
							</For>
						</div>
					</ArkDialog.Content>
				</ArkDialog.Positioner>
			</Portal>
		</Dialog>
	)
}
