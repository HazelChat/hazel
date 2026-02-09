/**
 * Emoji cropping utility — takes zoom/pan/rotation state and produces a 128x128 WebP blob.
 *
 * The crop window is a fixed square in the center of the viewport.
 * The image is positioned within that window via zoom (scale), pan (translate), and rotation.
 */

export interface ContentBounds {
	x: number
	y: number
	width: number
	height: number
}

const CONTENT_DETECT_MAX = 512
/** Squared color distance — pixel must differ from background by this much to be "content" */
const CONTENT_DIST_SQ = 30 * 30

/**
 * Detects the bounding box of visible content in an image.
 *
 * Estimates the background color by taking the per-channel median of all pixels
 * along the image border (robust to content touching edges). Then finds the
 * bounding box of pixels that differ from the background.
 *
 * Returns null if content fills >90% of the image (no useful crop).
 */
export function detectContentBounds(image: HTMLImageElement): ContentBounds | null {
	const { naturalWidth: w, naturalHeight: h } = image
	if (w === 0 || h === 0) return null

	const scale = Math.min(1, CONTENT_DETECT_MAX / Math.max(w, h))
	const sw = Math.round(w * scale)
	const sh = Math.round(h * scale)

	const canvas = document.createElement("canvas")
	canvas.width = sw
	canvas.height = sh
	const ctx = canvas.getContext("2d", { willReadFrequently: true })
	if (!ctx) return null

	ctx.drawImage(image, 0, 0, sw, sh)
	const { data } = ctx.getImageData(0, 0, sw, sh)

	// Collect RGBA values of all border pixels
	const edgeR: number[] = []
	const edgeG: number[] = []
	const edgeB: number[] = []
	const edgeA: number[] = []

	const pushEdge = (idx: number) => {
		edgeR.push(data[idx]!)
		edgeG.push(data[idx + 1]!)
		edgeB.push(data[idx + 2]!)
		edgeA.push(data[idx + 3]!)
	}

	// Top and bottom rows
	for (let x = 0; x < sw; x++) {
		pushEdge(x * 4)
		pushEdge(((sh - 1) * sw + x) * 4)
	}
	// Left and right columns (excluding corners already counted)
	for (let y = 1; y < sh - 1; y++) {
		pushEdge(y * sw * 4)
		pushEdge((y * sw + sw - 1) * 4)
	}

	// Per-channel median → robust background color
	const median = (arr: number[]) => {
		arr.sort((a, b) => a - b)
		const mid = arr.length >> 1
		return arr.length % 2 ? arr[mid]! : (arr[mid - 1]! + arr[mid]!) / 2
	}
	const bgR = median(edgeR)
	const bgG = median(edgeG)
	const bgB = median(edgeB)
	const bgA = median(edgeA)

	// Find bounding box of pixels that differ from background
	let minX = sw
	let minY = sh
	let maxX = -1
	let maxY = -1

	for (let y = 0; y < sh; y++) {
		for (let x = 0; x < sw; x++) {
			const idx = (y * sw + x) * 4
			const d =
				(data[idx]! - bgR) ** 2 +
				(data[idx + 1]! - bgG) ** 2 +
				(data[idx + 2]! - bgB) ** 2 +
				(data[idx + 3]! - bgA) ** 2
			if (d > CONTENT_DIST_SQ) {
				if (x < minX) minX = x
				if (x > maxX) maxX = x
				if (y < minY) minY = y
				if (y > maxY) maxY = y
			}
		}
	}

	if (maxX < 0) return null

	// If content covers >90% of the image, bounds aren't useful
	const contentArea = (maxX - minX + 1) * (maxY - minY + 1)
	if (contentArea > sw * sh * 0.9) return null

	const invScale = 1 / scale
	return {
		x: minX * invScale,
		y: minY * invScale,
		width: (maxX - minX + 1) * invScale,
		height: (maxY - minY + 1) * invScale,
	}
}

const OUTPUT_SIZE = 128

interface EmojiCropParams {
	image: HTMLImageElement
	/** Current zoom (scale factor mapping image pixels → display pixels) */
	zoom: number
	/** Pan offset in display pixels (from center) */
	panX: number
	/** Pan offset in display pixels (from center) */
	panY: number
	/** Rotation in degrees: 0, 90, 180, 270 */
	rotation: 0 | 90 | 180 | 270
	/** The size of the crop window in display pixels */
	cropSize: number
}

export async function cropEmoji({
	image,
	zoom,
	panX,
	panY,
	rotation,
	cropSize,
}: EmojiCropParams): Promise<Blob> {
	const canvas = document.createElement("canvas")
	canvas.width = OUTPUT_SIZE
	canvas.height = OUTPUT_SIZE

	const ctx = canvas.getContext("2d")
	if (!ctx) {
		throw new Error("Could not get canvas context")
	}

	// The output canvas maps 1:1 with the crop window.
	// Scale factor from crop-window pixels → output pixels
	const outputScale = OUTPUT_SIZE / cropSize

	// Move origin to output center
	ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)

	// Apply rotation
	ctx.rotate((rotation * Math.PI) / 180)

	// Apply the zoom and output scaling
	const totalScale = zoom * outputScale
	ctx.scale(totalScale, totalScale)

	// The image center in display coords is at (cropSize/2 + panX, cropSize/2 + panY)
	// relative to the crop window top-left. But since we translated to center already,
	// the pan is just the offset from center → divide by zoom to get image-space offset.
	// Actually, panX/panY are already in display pixels from center, so we translate
	// by pan/zoom to move in image-space.
	ctx.translate(panX / zoom, panY / zoom)

	// Draw image centered at origin
	ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob)
				} else {
					reject(new Error("Failed to create blob from canvas"))
				}
			},
			"image/webp",
			0.9,
		)
	})
}
