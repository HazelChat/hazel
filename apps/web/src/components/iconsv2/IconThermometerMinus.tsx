// solid/general
import type { Component, JSX } from "solid-js"

export const IconThermometerMinus: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Zm0 8a1 1 0 0 0-1 1v6.27A1.998 1.998 0 0 0 15 20a2 2 0 0 0 1-3.73V10a1 1 0 0 0-1-1ZM8.103 6.005a1 1 0 0 1 0 1.99L8 8H2a1 1 0 0 1 0-2h6z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThermometerMinus
