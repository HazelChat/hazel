// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02PngFormatDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 10a8 8 0 0 0-8-8H8a4 4 0 0 0-4 4v4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 19v-5h1.5a2.5 2.5 0 0 1 0 5zm0 0v2m7 0v-7l4 7v-7m7.25 1c-.451-.619-1.069-1-1.75-1-1.38 0-2.5 1.567-2.5 3.5s1.12 3.5 2.5 3.5c.681 0 1.299-.381 1.75-1v-2h-.75m-.5-8a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.025.713a2 2 0 0 0 1.662 1.662c.156.025.341.025.713.025h.6c1.306 0 2.418.835 2.83 2z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02PngFormatDuoStroke
