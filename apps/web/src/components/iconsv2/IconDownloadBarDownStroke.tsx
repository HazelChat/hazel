// stroke/general
import type { Component, JSX } from "solid-js"

export const IconDownloadBarDownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 20H5m1-9.83a30.2 30.2 0 0 0 5.406 5.62c.174.14.384.21.594.21m6-5.83a30.2 30.2 0 0 1-5.406 5.62A.95.95 0 0 1 12 16m0 0V4"
				fill="none"
			/>
		</svg>
	)
}

export default IconDownloadBarDownStroke
