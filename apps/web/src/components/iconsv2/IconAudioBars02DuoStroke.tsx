// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconAudioBars02DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 10v3m8-10v18m8-16v13"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 6v11m8-9v7m8-5v3"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconAudioBars02DuoStroke
