// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconThreeDotsMenuVerticalDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				opacity=".28"
			>
				<path d="M12 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none" />
				<path d="M12 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none" />
			</g>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuVerticalDuoStroke
