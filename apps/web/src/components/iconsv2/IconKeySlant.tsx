// solid/security
import type { Component, JSX } from "solid-js"

export const IconKeySlant: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.748 12.121a5 5 0 0 1 6.293-.636l7.849-7.849a1 1 0 0 1 1.414 0l2.121 2.121a1 1 0 1 1-1.414 1.415l-1.414-1.415-1.414 1.415.707.707a1 1 0 0 1-1.414 1.414l-.707-.707-4.314 4.313a5.002 5.002 0 0 1-7.707 6.294 5 5 0 0 1 0-7.072Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeySlant
