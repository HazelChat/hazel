// stroke/security
import type { Component, JSX } from "solid-js"

export const IconKeyTopRight02Stroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.243 4.93h2.828v2.828l-2.121 2.12h-1.621a.5.5 0 0 0-.5.5V12l-2.453 2.452a4.5 4.5 0 1 1-2.828-2.828z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.11 17.304 6.697 15.89a1.25 1.25 0 0 0 1.415 1.414z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyTopRight02Stroke
