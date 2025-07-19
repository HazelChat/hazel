// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconAnimation01DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.686 15.018a5.1 5.1 0 0 1-4.771 3.081M8.983 8.314A5.1 5.1 0 0 0 5.9 13.086m0 0a4.102 4.102 0 0 0 1.05 8.064 4.1 4.1 0 0 0 3.964-3.05M5.9 13.084a5.1 5.1 0 0 0 5.014 5.014"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.95 8.95a6.1 6.1 0 1 1 12.2 0 6.1 6.1 0 0 1-12.2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnimation01DuoStroke
