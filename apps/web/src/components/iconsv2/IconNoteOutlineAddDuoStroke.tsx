// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconNoteOutlineAddDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 12.125V8.8q0-.434-.002-.8m-7.873 12H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 17.72 3 16.88 3 15.2V8.8q0-.434.002-.8"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 22v-3m0 0v-3m0 3h-3m3 0h3M7.8 4h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311c.27.53.317 1.197.325 2.362H3.002c.008-1.165.055-1.831.325-2.362a3 3 0 0 1 1.311-1.311C5.28 4 6.12 4 7.8 4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconNoteOutlineAddDuoStroke
