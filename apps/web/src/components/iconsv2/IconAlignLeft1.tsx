// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.145 12.404a20.8 20.8 0 0 0 3.886 3.68 50.6 50.6 0 0 1 0-8.167 20.8 20.8 0 0 0-3.886 3.678.64.64 0 0 0 0 .81Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.866 12H20m-8.134 0q0 2.044.165 4.083a20.8 20.8 0 0 1-3.886-3.678.64.64 0 0 1 0-.81 20.8 20.8 0 0 1 3.886-3.678A51 51 0 0 0 11.866 12ZM4 19V5"
			/>
		</svg>
	)
}

export default IconAlignLeft1
