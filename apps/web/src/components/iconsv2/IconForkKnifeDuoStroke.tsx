// duo-stroke/food
import type { Component, JSX } from "solid-js"

export const IconForkKnifeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.004 21V10.536m11 10.464v-4.926"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.003 3 4.55 6.624a3.48 3.48 0 0 0 3.453 3.912m3-7.536.454 3.624a3.48 3.48 0 0 1-3.454 3.912m0 0V3m11 13.074V3.83a.829.829 0 0 0-1.288-.69 4.15 4.15 0 0 0-1.83 3.106l-.492 5.9c-.052.621-.077.932-.055 1.19a3 3 0 0 0 2.476 2.693c.255.044.566.044 1.19.044Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconForkKnifeDuoStroke
