import { useEffect, useRef, useState } from "react"
import { useZoomPanInteraction } from "~/hooks/use-zoom-pan-interaction"
import { type ContentBounds, cropEmoji, detectContentBounds } from "~/utils/emoji-crop"
import IconArrowPath from "~/components/icons/icon-arrow-path"
import IconMinus from "~/components/icons/icon-minus"
import IconPlus from "~/components/icons/icon-plus"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Loader } from "~/components/ui/loader"
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Slider, SliderFill, SliderThumb, SliderTrack } from "~/components/ui/slider"
import { TextField } from "~/components/ui/text-field"
import { Input } from "~/components/ui/input"
import { EmojiEditorCanvas } from "./emoji-editor-canvas"

const VIEWPORT_SIZE = 320
const CROP_SIZE = 256
const EMOJI_NAME_REGEX = /^[a-z0-9_-]+$/

type ImageState =
	| { status: "idle" }
	| { status: "loading" }
	| {
			status: "ready"
			element: HTMLImageElement
			dimensions: { width: number; height: number }
			src: string
			contentBounds: ContentBounds | null
	  }
	| {
			status: "processing"
			element: HTMLImageElement
			dimensions: { width: number; height: number }
			src: string
			contentBounds: ContentBounds | null
	  }

interface EmojiConfiguratorModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	imageFile: File | null
	onSave: (blob: Blob, name: string) => void
}

export function EmojiConfiguratorModal({
	isOpen,
	onOpenChange,
	imageFile,
	onSave,
}: EmojiConfiguratorModalProps) {
	const [imageState, setImageState] = useState<ImageState>({ status: "idle" })
	const [name, setName] = useState("")
	const [nameError, setNameError] = useState<string | null>(null)
	const objectUrlRef = useRef<string | null>(null)

	// Load image when file changes
	useEffect(() => {
		if (!imageFile) {
			setImageState({ status: "idle" })
			return
		}

		setImageState({ status: "loading" })
		const url = URL.createObjectURL(imageFile)
		objectUrlRef.current = url

		const img = new Image()
		img.onload = () => {
			let bounds: ContentBounds | null = null
			try {
				bounds = detectContentBounds(img)
			} catch (e) {
				console.warn("[emoji] detectContentBounds threw:", e)
			}
			console.warn("[emoji] image loaded", {
				naturalWidth: img.naturalWidth,
				naturalHeight: img.naturalHeight,
				contentBounds: bounds,
			})
			setImageState({
				status: "ready",
				element: img,
				dimensions: { width: img.naturalWidth, height: img.naturalHeight },
				src: url,
				contentBounds: bounds,
			})
		}
		img.onerror = () => {
			console.error("Failed to load image")
			setImageState({ status: "idle" })
			onOpenChange(false)
		}
		img.src = url

		return () => {
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current)
				objectUrlRef.current = null
			}
		}
	}, [imageFile, onOpenChange])

	// Reset name when modal opens with new file
	useEffect(() => {
		if (isOpen && imageFile) {
			const baseName = imageFile.name
				.replace(/\.[^.]+$/, "")
				.toLowerCase()
				.replace(/[^a-z0-9_-]/g, "_")
				.replace(/_+/g, "_")
				.slice(0, 64)
			setName(baseName)
			setNameError(validateName(baseName))
		}
	}, [isOpen, imageFile])

	const validateName = (value: string): string | null => {
		if (!value) return "Name is required"
		if (value.length > 64) return "Name must be 64 characters or less"
		if (!EMOJI_NAME_REGEX.test(value)) return "Only lowercase letters, numbers, hyphens, and underscores"
		return null
	}

	const handleNameChange = (value: string) => {
		const normalized = value.toLowerCase()
		setName(normalized)
		setNameError(validateName(normalized))
	}

	const isReady = imageState.status === "ready" || imageState.status === "processing"
	const isProcessing = imageState.status === "processing"

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="3xl" isDismissable={!isProcessing}>
				<ModalHeader>
					<ModalTitle>Add Custom Emoji</ModalTitle>
				</ModalHeader>
				<ModalBody className="py-6">
					{isReady ? (
						<EmojiConfiguratorReady
							imageState={imageState as ImageState & { status: "ready" | "processing" }}
							setImageState={setImageState}
							name={name}
							nameError={nameError}
							onNameChange={handleNameChange}
							isProcessing={isProcessing}
							onSave={onSave}
						/>
					) : (
						<div className="flex h-64 items-center justify-center">
							<Loader className="size-8" />
						</div>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

/**
 * Inner component rendered only when the image is loaded.
 * This lets us call useZoomPanInteraction unconditionally (hooks can't be conditional).
 */
function EmojiConfiguratorReady({
	imageState,
	setImageState,
	name,
	nameError,
	onNameChange,
	isProcessing,
	onSave,
}: {
	imageState: {
		status: "ready" | "processing"
		element: HTMLImageElement
		dimensions: { width: number; height: number }
		src: string
		contentBounds: ContentBounds | null
	}
	setImageState: React.Dispatch<React.SetStateAction<ImageState>>
	name: string
	nameError: string | null
	onNameChange: (value: string) => void
	isProcessing: boolean
	onSave: (blob: Blob, name: string) => void
}) {
	const { dimensions, src, element, contentBounds } = imageState
	const interaction = useZoomPanInteraction({
		imageWidth: dimensions.width,
		imageHeight: dimensions.height,
		cropSize: CROP_SIZE,
		contentBounds,
	})

	const handleSave = async () => {
		if (imageState.status !== "ready" || nameError || !name) return

		setImageState({ ...imageState, status: "processing" })

		try {
			const blob = await cropEmoji({
				image: element,
				zoom: interaction.state.zoom,
				panX: interaction.state.panX,
				panY: interaction.state.panY,
				rotation: interaction.state.rotation,
				cropSize: CROP_SIZE,
			})
			onSave(blob, name)
		} catch (error) {
			console.error("Failed to crop emoji:", error)
			setImageState({ ...imageState, status: "ready" })
		}
	}

	return (
		<div className="flex flex-col gap-6 sm:flex-row">
			{/* Left column — editor */}
			<div className="flex shrink-0 flex-col items-center gap-3">
				<div className="overflow-hidden rounded-lg">
					<EmojiEditorCanvas
						imageSrc={src}
						imageWidth={dimensions.width}
						imageHeight={dimensions.height}
						viewportSize={VIEWPORT_SIZE}
						cropSize={CROP_SIZE}
						interaction={interaction}
					/>
				</div>

				{/* Toolbar */}
				<div className="flex w-full items-center gap-2">
					<Button
						intent="outline"
						size="sq-sm"
						onPress={() => interaction.rotateClockwise()}
						aria-label="Rotate clockwise"
					>
						<IconArrowPath data-slot="icon" />
					</Button>
					<IconMinus className="size-4 shrink-0 text-muted-fg" />
					<Slider
						value={[interaction.state.zoom]}
						minValue={interaction.minZoom}
						maxValue={interaction.maxZoom}
						step={0.01}
						onChange={(value: number | number[]) => {
							const v = Array.isArray(value) ? (value[0] ?? 1) : value
							interaction.setZoom(v)
						}}
						aria-label="Zoom"
						className="flex-1"
					>
						<SliderTrack>
							<SliderFill />
							<SliderThumb />
						</SliderTrack>
					</Slider>
					<IconPlus className="size-4 shrink-0 text-muted-fg" />
				</div>

				<p className="text-center text-muted-fg text-xs">Drag image to reposition</p>
			</div>

			{/* Right column — preview + name */}
			<div className="flex flex-1 flex-col gap-4">
				{/* Preview card */}
				<div className="rounded-lg border border-border p-4">
					<p className="mb-3 font-medium text-muted-fg text-xs uppercase tracking-wider">Preview</p>

					{/* In-message preview */}
					<div className="mb-3 flex items-center gap-1.5 text-sm">
						<span className="text-fg">Great work today</span>
						<EmojiPreview
							src={src}
							imageWidth={dimensions.width}
							imageHeight={dimensions.height}
							state={interaction.state}
							size={20}
							cropSize={CROP_SIZE}
						/>
					</div>

					{/* Standalone preview */}
					<div className="flex items-center gap-2">
						<EmojiPreview
							src={src}
							imageWidth={dimensions.width}
							imageHeight={dimensions.height}
							state={interaction.state}
							size={48}
							cropSize={CROP_SIZE}
						/>
						{name && <span className="text-muted-fg text-sm">:{name}:</span>}
					</div>
				</div>

				{/* Name input */}
				<TextField value={name} onChange={onNameChange} isInvalid={!!nameError}>
					<Label>Emoji name</Label>
					<Input placeholder="e.g. partyparrot" />
					{nameError ? (
						<Description className="text-danger">{nameError}</Description>
					) : (
						<Description>
							{name ? `:${name}:` : "Lowercase, numbers, hyphens, underscores"}
						</Description>
					)}
				</TextField>

				{/* Save button */}
				<Button
					intent="primary"
					className="w-full"
					onPress={handleSave}
					isDisabled={!name || !!nameError || isProcessing}
				>
					{isProcessing ? (
						<>
							<Loader data-slot="loader" />
							Saving...
						</>
					) : (
						"Save Emoji"
					)}
				</Button>
			</div>
		</div>
	)
}

/**
 * Miniature CSS-transform preview of the cropped emoji.
 * Uses the same transform math as the editor canvas.
 */
function EmojiPreview({
	src,
	imageWidth,
	imageHeight,
	state,
	size,
	cropSize,
}: {
	src: string
	imageWidth: number
	imageHeight: number
	state: { zoom: number; panX: number; panY: number; rotation: number }
	size: number
	cropSize: number
}) {
	// Scale from crop window → preview size
	const previewScale = size / cropSize

	return (
		<div className="shrink-0 overflow-hidden rounded" style={{ width: size, height: size }}>
			<div
				style={{
					width: cropSize,
					height: cropSize,
					transform: `scale(${previewScale})`,
					transformOrigin: "0 0",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<img
					src={src}
					alt=""
					draggable={false}
					className="pointer-events-none absolute"
					style={{
						left: "50%",
						top: "50%",
						transformOrigin: "0 0",
						transform: [
							`translate(${state.panX}px, ${state.panY}px)`,
							`rotate(${state.rotation}deg)`,
							`scale(${state.zoom})`,
							`translate(-${imageWidth / 2}px, -${imageHeight / 2}px)`,
						].join(" "),
					}}
				/>
			</div>
		</div>
	)
}
