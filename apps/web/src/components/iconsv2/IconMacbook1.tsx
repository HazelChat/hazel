// contrast/devices
import type { Component, JSX } from "solid-js"

export const IconMacbook1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22 17a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1h5.5l1 1H14l1-1h6a1 1 0 0 1 1 1Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 16V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C18.72 4 17.88 4 16.2 4H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 6.28 3 7.12 3 8.8V16m18 0h-6l-1 1H9.5l-1-1H3m18 0a1 1 0 0 1 1 1 3 3 0 0 1-3 3H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1M13 4.007V5h-2v-.993"
			/>
		</svg>
	)
}

export default IconMacbook1
