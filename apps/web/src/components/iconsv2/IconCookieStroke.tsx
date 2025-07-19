// stroke/food
import type { Component, JSX } from "solid-js"

export const IconCookieStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.404 8.193v.01m2.386 9.48v.01M16 5v.01M20 5v.01M21 9v.01m-3.975.965a5.5 5.5 0 0 1-5.828-6.94 9 9 0 1 0 9.593 10.91 4.5 4.5 0 0 1-3.765-3.97ZM9 13.018a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm6.717 1.748a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCookieStroke
