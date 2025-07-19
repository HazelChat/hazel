// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconDiscountBadgeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.863 20.322a2.925 2.925 0 0 0 4.274 0 2.93 2.93 0 0 1 2.236-.926 2.925 2.925 0 0 0 3.023-3.023 2.93 2.93 0 0 1 .926-2.236 2.925 2.925 0 0 0 0-4.274 2.93 2.93 0 0 1-.926-2.236 2.925 2.925 0 0 0-3.023-3.023 2.93 2.93 0 0 1-2.236-.926 2.925 2.925 0 0 0-4.274 0 2.93 2.93 0 0 1-2.236.926 2.925 2.925 0 0 0-3.023 3.023 2.93 2.93 0 0 1-.926 2.236 2.925 2.925 0 0 0 0 4.274c.617.577.955 1.392.926 2.236a2.925 2.925 0 0 0 3.023 3.023 2.93 2.93 0 0 1 2.236.926Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 15.364 15.364 9m-6.114.25h.01m5.854 5.864h.01M9.5 9.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDiscountBadgeDuoStroke
