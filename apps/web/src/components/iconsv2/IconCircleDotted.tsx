// contrast/general
import type { Component, JSX } from "solid-js"

export const IconCircleDotted: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.425 4.08v.01M4.08 7.421v.01m-1.23 4.563v.01m1.23 4.562v.01m3.345 3.333v.01M12 21.14v.01m4.575-1.24v.01m3.345-3.353v.01m1.23-4.583v.01m-1.23-4.582v.01M16.575 4.08v.01M12 2.85v.01"
			/>
		</svg>
	)
}

export default IconCircleDotted
