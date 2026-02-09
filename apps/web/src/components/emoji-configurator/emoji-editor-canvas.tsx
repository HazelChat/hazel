import { useEffect, useRef } from "react"
import type { UseZoomPanInteractionReturn } from "~/hooks/use-zoom-pan-interaction"
import { cx } from "~/utils/cx"

interface EmojiEditorCanvasProps {
	imageSrc: string
	imageWidth: number
	imageHeight: number
	/** Total viewport size in px (e.g. 320) */
	viewportSize: number
	/** Crop window size in px (e.g. 256) */
	cropSize: number
	/** Interaction state + handlers from the parent */
	interaction: UseZoomPanInteractionReturn
}

export function EmojiEditorCanvas({
	imageSrc,
	imageWidth,
	imageHeight,
	viewportSize,
	cropSize,
	interaction,
}: EmojiEditorCanvasProps) {
	const { isDragging, handlePointerDown, handleWheel, getImageTransform } = interaction
	const cropRef = useRef<HTMLDivElement>(null)

	// Register wheel with { passive: false } so preventDefault() actually works
	useEffect(() => {
		const el = cropRef.current
		if (!el) return
		el.addEventListener("wheel", handleWheel, { passive: false })
		return () => el.removeEventListener("wheel", handleWheel)
	}, [handleWheel])

	const transform = getImageTransform()
	const offset = (viewportSize - cropSize) / 2

	return (
		<div
			className="relative overflow-hidden"
			style={{
				width: viewportSize,
				height: viewportSize,
				// Checkered transparency background
				backgroundImage: [
					"linear-gradient(45deg, var(--color-secondary) 25%, transparent 25%)",
					"linear-gradient(-45deg, var(--color-secondary) 25%, transparent 25%)",
					"linear-gradient(45deg, transparent 75%, var(--color-secondary) 75%)",
					"linear-gradient(-45deg, transparent 75%, var(--color-secondary) 75%)",
				].join(", "),
				backgroundSize: "16px 16px",
				backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
			}}
		>
			{/* Dark overlay — top */}
			<div className="absolute top-0 right-0 left-0 bg-black/60" style={{ height: offset }} />
			{/* Dark overlay — bottom */}
			<div className="absolute right-0 bottom-0 left-0 bg-black/60" style={{ height: offset }} />
			{/* Dark overlay — left */}
			<div
				className="absolute left-0 bg-black/60"
				style={{ top: offset, height: cropSize, width: offset }}
			/>
			{/* Dark overlay — right */}
			<div
				className="absolute right-0 bg-black/60"
				style={{ top: offset, height: cropSize, width: offset }}
			/>

			{/* Crop window border */}
			<div
				className="pointer-events-none absolute border-2 border-white/80"
				style={{ top: offset, left: offset, width: cropSize, height: cropSize }}
			/>

			{/* Crop window — image area */}
			<div
				ref={cropRef}
				className={cx(
					"absolute touch-none select-none overflow-hidden",
					isDragging ? "cursor-grabbing" : "cursor-grab",
				)}
				style={{ top: offset, left: offset, width: cropSize, height: cropSize }}
				onPointerDown={handlePointerDown}
			>
				<img
					src={imageSrc}
					alt="Emoji editor"
					draggable={false}
					className="pointer-events-none absolute"
					style={{
						left: "50%",
						top: "50%",
						transformOrigin: "0 0",
						transform: [
							`translate(${transform.x}px, ${transform.y}px)`,
							`rotate(${transform.rotation}deg)`,
							`scale(${transform.scale})`,
							`translate(-${imageWidth / 2}px, -${imageHeight / 2}px)`,
						].join(" "),
					}}
				/>
			</div>
		</div>
	)
}
