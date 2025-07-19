// contrast/food
import type { Component, JSX } from "solid-js"

export const IconEggBroken1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.39 14.111a7.389 7.389 0 1 1-14.779 0c0-4.08 3.308-11.611 7.39-11.611 4.08 0 7.388 7.53 7.388 11.611Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.657 13.676c-1.309-.442-2.24-1.329-2.937-2.44a.06.06 0 0 1 .003-.069l1.813-2.51a.095.095 0 0 0 .003-.109 9.5 9.5 0 0 0-3.093-2.863m0 0C5.72 8.229 4.611 11.748 4.611 14.11a7.389 7.389 0 1 0 14.778 0C19.39 10.031 16.081 2.5 12 2.5c-1.718 0-3.299 1.335-4.554 3.185Z"
			/>
		</svg>
	)
}

export default IconEggBroken1
