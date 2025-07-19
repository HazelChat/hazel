// solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyRight02: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.11 9a5.5 5.5 0 1 0 0 6H14a1 1 0 0 0 .707-.293l.793-.793.793.793A1 1 0 0 0 17 15h3a1 1 0 0 0 .707-.293l2-2a1 1 0 0 0 0-1.414l-2-2A1 1 0 0 0 20 9zm-6.27 1.12A1.1 1.1 0 0 1 6.6 11v2a1.1 1.1 0 0 1-1.76.88 2.35 2.35 0 0 1 0-3.76Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeyRight02
