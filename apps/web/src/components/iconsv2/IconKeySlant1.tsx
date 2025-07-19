// contrast/security
import type { Component, JSX } from "solid-js"

export const IconKeySlant1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.455 18.485a4 4 0 1 0 5.657-5.656 4 4 0 0 0-5.657 5.656Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.112 12.828a4 4 0 1 1-5.657 5.657 4 4 0 0 1 5.657-5.657Zm0 0 8.485-8.485 2.121 2.121m-4.95.708 1.415 1.414"
			/>
		</svg>
	)
}

export default IconKeySlant1
