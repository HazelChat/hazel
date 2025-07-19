// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconLinkChainHorizontalDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.1 11q-.1.486-.1 1c0 1.636.786 3.088 2 4 .836.628 1.874 1 3 1h2a5 5 0 0 0 0-10h-1"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.9 13q.1-.486.1-1a5 5 0 0 0-2-4 4.98 4.98 0 0 0-3-1H7a5 5 0 0 0 0 10h1"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkChainHorizontalDuoStroke
