// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconTextQuotesParagraphDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 20h18"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 14h18"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 7h4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3.5 7H5a1 1 0 0 1 0 2h-.5A1.5 1.5 0 0 1 3 7.5V6.4A2.4 2.4 0 0 1 5.4 4"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.5 7H12a1 1 0 1 1 0 2h-.5A1.5 1.5 0 0 1 10 7.5V6.4A2.4 2.4 0 0 1 12.4 4"
				fill="none"
			/>
		</svg>
	)
}

export default IconTextQuotesParagraphDuoStroke
