// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDemergeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.264 4.264 12 12v8m7.736-15.736L15 9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.943 4.286a20.6 20.6 0 0 0-5.296-.2.62.62 0 0 0-.56.56 20.6 20.6 0 0 0 .199 5.297m9.771-5.657a20.6 20.6 0 0 1 5.296-.2.62.62 0 0 1 .56.56 20.6 20.6 0 0 1-.199 5.297"
				fill="none"
			/>
		</svg>
	)
}

export default IconDemergeDuoStroke
