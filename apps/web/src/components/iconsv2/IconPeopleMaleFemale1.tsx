// contrast/users
import type { Component, JSX } from "solid-js"

export const IconPeopleMaleFemale1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M6 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-.74 3a3 3 0 0 0-2.99 2.75L2 16h2l.294 4.403a1.71 1.71 0 0 0 3.414 0L8 16l2 .047-.272-3.294A3 3 0 0 0 6.738 10zm14.736-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-1.992 5c-1.39 0-2.58.997-2.823 2.365L14 19h2l.494 1.841a1.563 1.563 0 0 0 3.021-.005L20 19h2l-1.172-6.632A2.87 2.87 0 0 0 18.004 10Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.27 12.75A3 3 0 0 1 5.26 10h1.478a3 3 0 0 1 2.99 2.753L10 16.047 8 16l-.292 4.402a1.71 1.71 0 0 1-3.414.001L4 16H2z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.181 12.365a2.867 2.867 0 0 1 5.647.003L22 19h-2l-.485 1.836a1.563 1.563 0 0 1-3.021.005L16 19h-2z"
			/>
		</svg>
	)
}

export default IconPeopleMaleFemale1
