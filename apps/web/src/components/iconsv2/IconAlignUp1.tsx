// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignUp1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.596 8.145a20.8 20.8 0 0 0-3.68 3.886c2.718-.22 5.45-.22 8.167 0a20.8 20.8 0 0 0-3.678-3.886.64.64 0 0 0-.81 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 11.866V20m0-8.134q-2.044 0-4.083.165a20.8 20.8 0 0 1 3.678-3.886.64.64 0 0 1 .81 0 20.8 20.8 0 0 1 3.678 3.886A51 51 0 0 0 12 11.866ZM5 4h14"
			/>
		</svg>
	)
}

export default IconAlignUp1
