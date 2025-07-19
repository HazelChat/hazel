// contrast/medical
import type { Component, JSX } from "solid-js"

export const IconStethoscope1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M21.5 11.512a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.5 3.012a2.5 2.5 0 0 1 2.5 2.5v1.684c0 1.82-.638 3.581-1.803 4.979l-.245.295A3.82 3.82 0 0 1 8 13.852M5.5 3.012a2.5 2.5 0 0 0-2.5 2.5v1.684c0 1.82.638 3.581 1.803 4.979l.245.295A3.82 3.82 0 0 0 8 13.852m11 .16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 0v1.5a5.5 5.5 0 1 1-11 0v-1.66"
			/>
		</svg>
	)
}

export default IconStethoscope1
