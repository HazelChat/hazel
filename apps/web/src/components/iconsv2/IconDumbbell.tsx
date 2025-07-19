// solid/sports
import type { Component, JSX } from "solid-js"

export const IconDumbbell: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M4 7a3 3 0 0 1 6 0v3h4V7a3 3 0 1 1 6 0v1a3 3 0 1 1 0 6v1a3 3 0 1 1-6 0v-3h-4v3a3 3 0 1 1-6 0v-1a3 3 0 1 1 0-6zm0 3a1 1 0 1 0 0 2zm16 2a1 1 0 1 0 0-2z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDumbbell
