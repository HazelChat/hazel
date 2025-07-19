// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnUpLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.859 4a25.2 25.2 0 0 0-4.684 4.505.79.79 0 0 0 0 .99A25.2 25.2 0 0 0 8.859 14c-.16-.935-.241-1.402-.303-1.87a24 24 0 0 1 0-6.26c.062-.468.142-.935.303-1.87Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.351 9H12c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C20 12.8 20 14.2 20 17v3M8.351 9a24 24 0 0 1 .205-3.13c.062-.468.142-.935.303-1.87a25.2 25.2 0 0 0-4.684 4.505.79.79 0 0 0 0 .99A25.2 25.2 0 0 0 8.859 14c-.16-.935-.241-1.402-.303-1.87A24 24 0 0 1 8.351 9Z"
			/>
		</svg>
	)
}

export default IconArrowTurnUpLeft1
