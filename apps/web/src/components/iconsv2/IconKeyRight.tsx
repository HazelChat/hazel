// solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 7a5 5 0 0 1 4.9 4H22a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-2h-2v1a1 1 0 1 1-2 0v-1h-6.1A5.002 5.002 0 0 1 1 12a5 5 0 0 1 5-5Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeyRight
