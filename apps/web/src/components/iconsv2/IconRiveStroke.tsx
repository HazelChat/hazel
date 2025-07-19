// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconRiveStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 3h10a5 5 0 0 1 .947 9.91M9 13h5q.486 0 .947-.09m0 0L20 21"
				fill="none"
			/>
		</svg>
	)
}

export default IconRiveStroke
