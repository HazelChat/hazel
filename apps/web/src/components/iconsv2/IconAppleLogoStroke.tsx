// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconAppleLogoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.161 10.199a4.34 4.34 0 0 0-3.433-1.78c-1.472-.187-2.845.844-3.63.844s-1.864-.843-3.139-.75c-2.256 0-4.807 1.78-4.807 5.338 0 3.84 3.14 8.241 5.101 8.148 1.276 0 1.57-.75 3.041-.75 1.472 0 1.766.75 3.14.75 1.863 0 3.727-2.997 4.414-4.683-3.14-1.592-3.532-5.338-.687-7.117Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.755 2c-3.638 0-4.684 2.093-4.657 4.176 3.112.01 4.681-2.083 4.657-4.176Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAppleLogoStroke
