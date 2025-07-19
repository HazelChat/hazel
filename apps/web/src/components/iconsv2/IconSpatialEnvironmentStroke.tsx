// stroke/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconSpatialEnvironmentStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 17.134q-.509.127-1.013.272c-.16.046-.323.095-.649.193l-.086.025a1 1 0 0 1-1.251-.931L2 16.603V4.307a1 1 0 0 1 1.252-.93 61 61 0 0 0 .735.218 29 29 0 0 0 16.026 0l.649-.194.086-.025a1 1 0 0 1 1.251.931l.001.09v12.296a1 1 0 0 1-1.252.93 59 59 0 0 0-.735-.218 29 29 0 0 0-1.013-.27M17 21a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3m7.5-8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSpatialEnvironmentStroke
