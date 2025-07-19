// stroke/users
import type { Component, JSX } from "solid-js"

export const IconPeopleMaleFemaleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.27 12.75A3 3 0 0 1 5.26 10h1.478a3 3 0 0 1 2.99 2.753L10 16.047 8 16l-.292 4.402a1.71 1.71 0 0 1-3.414.001L4 16H2z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.181 12.365a2.867 2.867 0 0 1 5.647.003L22 19h-2l-.485 1.836a1.563 1.563 0 0 1-3.021.005L16 19h-2z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPeopleMaleFemaleStroke
