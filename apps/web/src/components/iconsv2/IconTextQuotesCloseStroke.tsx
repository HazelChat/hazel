// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconTextQuotesCloseStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 0a9.4 9.4 0 0 1-4 7.698M20 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 0a9.4 9.4 0 0 1-4 7.698"
				fill="none"
			/>
		</svg>
	)
}

export default IconTextQuotesCloseStroke
