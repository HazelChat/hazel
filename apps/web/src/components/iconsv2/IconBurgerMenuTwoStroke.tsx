// stroke/general
import type { Component, JSX } from "solid-js"

export const IconBurgerMenuTwoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 16h16M4 8h16"
				fill="none"
			/>
		</svg>
	)
}

export default IconBurgerMenuTwoStroke
