// contrast/general
import type { Component, JSX } from "solid-js"

export const IconPinSlant1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.764 4.247a1.6 1.6 0 0 1 2.385-.396 38 38 0 0 1 5 5 1.6 1.6 0 0 1-.396 2.386l-3.592 2.196c-.666.407-.838 1.15-.662 1.865a4.54 4.54 0 0 1-1.197 4.3.505.505 0 0 1-.66.047c-1.76-1.32-3.436-2.738-4.993-4.294-1.556-1.556-2.973-3.234-4.293-4.993a.504.504 0 0 1 .047-.66 4.54 4.54 0 0 1 4.3-1.197c.714.177 1.457.004 1.865-.662z"
				opacity=".3"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8.649 15.351-5.167 5.167m5.167-5.167c-1.556-1.556-2.974-3.234-4.294-4.993a.504.504 0 0 1 .047-.66 4.54 4.54 0 0 1 4.3-1.197c.715.177 1.458.004 1.865-.662l2.197-3.592a1.6 1.6 0 0 1 2.385-.396 38 38 0 0 1 5 5 1.6 1.6 0 0 1-.396 2.386l-3.592 2.196c-.666.407-.839 1.15-.662 1.865a4.54 4.54 0 0 1-1.197 4.3.505.505 0 0 1-.66.047c-1.76-1.32-3.437-2.738-4.993-4.294Z"
			/>
		</svg>
	)
}

export default IconPinSlant1
