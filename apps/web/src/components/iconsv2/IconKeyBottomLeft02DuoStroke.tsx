// duo-stroke/security
import type { Component, JSX } from "solid-js"

export const IconKeyBottomLeft02DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.293 9.879 4.93 16.243v2.828h2.829l2.12-2.121v-1.622a.5.5 0 0 1 .5-.5h1.62l2.122-2.12"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m11.293 9.88.33-.332a4.5 4.5 0 1 1 2.83 2.828l-.332.331"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.304 8.11 15.89 6.696a1.25 1.25 0 0 1 1.414 1.414Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyBottomLeft02DuoStroke
