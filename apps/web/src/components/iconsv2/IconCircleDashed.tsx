// contrast/general
import type { Component, JSX } from "solid-js"

export const IconCircleDashed: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 1 0 18.3 0 9.15 9.15 0 0 0-18.3 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.262 3.017a9.1 9.1 0 0 1 3.476 0m3.384 1.4a9.1 9.1 0 0 1 2.461 2.47m1.4 3.375a9.1 9.1 0 0 1 0 3.476m-1.4 3.384a9.1 9.1 0 0 1-2.47 2.46m-3.375 1.4a9.1 9.1 0 0 1-3.476 0m-3.384-1.4a9.1 9.1 0 0 1-2.46-2.47m-1.4-3.374a9.1 9.1 0 0 1 0-3.476m1.4-3.385a9.1 9.1 0 0 1 2.47-2.46"
			/>
		</svg>
	)
}

export default IconCircleDashed
