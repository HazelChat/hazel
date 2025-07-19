// stroke/security
import type { Component, JSX } from "solid-js"

export const IconKeySlantStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.11 12.828a4 4 0 1 1-5.656 5.657 4 4 0 0 1 5.657-5.657Zm0 0 8.486-8.485 2.121 2.121m-4.95.708 1.415 1.414"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeySlantStroke
