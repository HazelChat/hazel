// solid/general
import type { Component, JSX } from "solid-js"

export const IconToggleOn: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1 12a8 8 0 0 1 8-8h6a8 8 0 0 1 0 16H9a8 8 0 0 1-8-8Zm9 0a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconToggleOn
