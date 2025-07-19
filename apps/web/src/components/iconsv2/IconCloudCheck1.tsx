// contrast/development
import type { Component, JSX } from "solid-js"

export const IconCloudCheck1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22 14.5a5.5 5.5 0 0 1-5.5 5.5h-10a4.5 4.5 0 0 1-.483-8.974 6.5 6.5 0 0 1 12.651-1.582A5.5 5.5 0 0 1 22 14.5Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m9 13.597 2.341 2.339A15 15 0 0 1 15.9 11m.601 9a5.5 5.5 0 0 0 2.168-10.556 6.5 6.5 0 0 0-12.651 1.582A4.5 4.5 0 0 0 6.5 20z"
			/>
		</svg>
	)
}

export default IconCloudCheck1
