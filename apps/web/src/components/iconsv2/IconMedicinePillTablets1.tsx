// contrast/medical
import type { Component, JSX } from "solid-js"

export const IconMedicinePillTablets1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M8.056 11.889a5 5 0 1 1-2.11-9.776 5 5 0 0 1 2.11 9.776Z" />
				<path fill="currentColor" d="M15.283 21.697a5 5 0 1 1 3.437-9.391 5 5 0 0 1-3.437 9.39Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m12.306 15.283 9.39 3.437m-9.39-3.437a5 5 0 0 0 9.39 3.437m-9.39-3.437a5 5 0 0 1 9.39 3.437M2.115 8.056l9.775-2.11m-9.775 2.11a5 5 0 0 0 9.775-2.11m-9.775 2.11a5 5 0 0 1 9.775-2.11"
			/>
		</svg>
	)
}

export default IconMedicinePillTablets1
