// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconWebhookDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m10.08 10.006-4.084 7.488m10.095-3.515-4.092-7.484M9.991 17.501l8.53-.008"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.996 6.494a4 4 0 1 0-5.916 3.512m5.767 10.849a4 4 0 1 0 .244-6.876m-12.02.016a4 4 0 1 0 5.92 3.507"
				fill="none"
			/>
		</svg>
	)
}

export default IconWebhookDuoStroke
