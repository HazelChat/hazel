// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconAlphabetAbcLowercaseDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21.6 15.389a2.4 2.4 0 0 1-4-1.789v-.2a2.4 2.4 0 0 1 4-1.789M9.995 13.4v.2m0-.2a2.4 2.4 0 1 1 4.8 0v.2a2.4 2.4 0 1 1-4.8 0m0-.2V8m0 5.6v2.5"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.8 13.6a2.4 2.4 0 1 1-4.8 0v-.2a2.4 2.4 0 1 1 4.8 0m0 .2v-.2m0 .2v2.5m0-2.7v-2.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlphabetAbcLowercaseDuoStroke
