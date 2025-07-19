// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconExchangeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 15.812a15 15 0 0 0-2.556-2.655A.7.7 0 0 0 7 13m-3 2.812a15 15 0 0 1 2.556-2.655A.7.7 0 0 1 7 13m0 0v8M20 8.188a15 15 0 0 1-2.556 2.655A.7.7 0 0 1 17 11m-3-2.812c.74.987 1.599 1.879 2.556 2.655A.7.7 0 0 0 17 11m0 0V3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3.85 6a3.15 3.15 0 1 0 6.3 0 3.15 3.15 0 0 0-6.3 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.85 18a3.15 3.15 0 1 0 6.3 0 3.15 3.15 0 0 0-6.3 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconExchangeDuoStroke
