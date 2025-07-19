// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconUturnDown1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M7.596 19.855a20.8 20.8 0 0 1-3.68-3.886l2.32.17a24 24 0 0 0 3.528 0l2.32-.17a20.8 20.8 0 0 1-3.68 3.886.64.64 0 0 1-.808 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 16.205V9a5 5 0 0 1 10 0v3M8 16.205a24 24 0 0 1-1.764-.065l-2.32-.17a20.8 20.8 0 0 0 3.68 3.885.64.64 0 0 0 .809 0 20.8 20.8 0 0 0 3.678-3.886l-2.32.171A24 24 0 0 1 8 16.205Z"
			/>
		</svg>
	)
}

export default IconUturnDown1
