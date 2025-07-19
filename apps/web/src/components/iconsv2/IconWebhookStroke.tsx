// stroke/development
import type { Component, JSX } from "solid-js"

export const IconWebhookStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.996 6.494a4 4 0 1 0-5.916 3.512l-4.084 7.488m9.851 3.36a4 4 0 1 0 .244-6.875L12 6.495m-7.928 7.5a4 4 0 1 0 5.92 3.507l8.528-.008"
				fill="none"
			/>
		</svg>
	)
}

export default IconWebhookStroke
