// stroke/media
import type { Component, JSX } from "solid-js"

export const IconResolutionQualityHqStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.754 8.75v3.5m0 0h3.5m-3.5 0v3m3.5-3v-3.5m0 3.5v3m5.168-.923v1.531M7 4h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Zm6.754 6.298a1.75 1.75 0 1 1 3.5 0v2.28a1.75 1.75 0 0 1-3.5 0z"
				fill="none"
			/>
		</svg>
	)
}

export default IconResolutionQualityHqStroke
