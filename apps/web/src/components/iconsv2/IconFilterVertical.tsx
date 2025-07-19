// solid/general
import type { Component, JSX } from "solid-js"

export const IconFilterVertical: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 3a1 1 0 1 0-2 0v2.126C4.275 5.57 3 7.136 3 9v1a4 4 0 0 0 8 0V9a4 4 0 0 0-3-3.874z"
				fill="currentColor"
			/>
			<path
				d="M18 3a1 1 0 1 0-2 0v6.126c-1.725.444-3 2.01-3 3.874v1a4 4 0 0 0 8 0v-1a4 4 0 0 0-3-3.874z"
				fill="currentColor"
			/>
			<path d="M8 16a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M18 20a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" fill="currentColor" />
		</svg>
	)
}

export default IconFilterVertical
