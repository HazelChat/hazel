// solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 7a5 5 0 0 0-4.9 4H2a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0v-2h2v1a1 1 0 1 0 2 0v-1h6.1a5.002 5.002 0 0 0 9.9-1 5 5 0 0 0-5-5Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeyLeft
