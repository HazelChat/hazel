/**
 * Emoji cropping utility — takes zoom/pan/rotation state and produces a 128x128 WebP blob.
 *
 * The crop window is a fixed square in the center of the viewport.
 * The image is positioned within that window via zoom (scale), pan (translate), and rotation.
 */

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
