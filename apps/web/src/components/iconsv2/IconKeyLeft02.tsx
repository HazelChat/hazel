// solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyLeft02: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.89 9a5.5 5.5 0 1 1 0 6H10a1 1 0 0 1-.707-.293l-.793-.793-.793.793A1 1 0 0 1 7 15H4a1 1 0 0 1-.707-.293l-2-2a1 1 0 0 1 0-1.414l2-2A1 1 0 0 1 4 9zm6.27 1.12a1.1 1.1 0 0 0-1.76.88v2a1.1 1.1 0 0 0 1.76.88 2.35 2.35 0 0 0 0-3.76Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeyLeft02
