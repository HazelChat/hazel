// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconProductHuntStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 13.625V8h2.813a2.813 2.813 0 0 1 0 5.625zm0 0V17m2 4.15a9.15 9.15 0 1 1 0-18.3 9.15 9.15 0 0 1 0 18.3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconProductHuntStroke
