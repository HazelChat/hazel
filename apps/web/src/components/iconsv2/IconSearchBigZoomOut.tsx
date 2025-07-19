// solid/general
import type { Component, JSX } from "solid-js"

export const IconSearchBigZoomOut: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 11.5a9.5 9.5 0 1 1 16.888 5.973l2.82 2.82a1 1 0 0 1-1.415 1.414l-2.82-2.82A9.5 9.5 0 0 1 2 11.5Zm6.5-1a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSearchBigZoomOut
