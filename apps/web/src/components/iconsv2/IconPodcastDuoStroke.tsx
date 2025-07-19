// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconPodcastDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 14a5 5 0 1 1 8 0m1 4.483a9 9 0 1 0-10 0"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.633 17.897a1.442 1.442 0 1 1 2.735 0L12 22z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPodcastDuoStroke
