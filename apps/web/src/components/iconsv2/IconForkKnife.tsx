// solid/food
import type { Component, JSX } from "solid-js"

export const IconForkKnife: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.004 17.057V21a1 1 0 0 0 2 0V3.83c0-1.459-1.627-2.333-2.844-1.521a5.15 5.15 0 0 0-2.272 3.855l-.499 5.993c-.044.53-.077.923-.047 1.268a4 4 0 0 0 3.301 3.59q.17.03.36.042Z"
				fill="currentColor"
			/>
			<path
				d="M5.124 2.008a1 1 0 0 1 .868 1.116L5.54 6.75A2.48 2.48 0 0 0 7 9.326V3a1 1 0 1 1 2 0v6.326a2.48 2.48 0 0 0 1.46-2.577l-.452-3.625a1 1 0 1 1 1.984-.248l.453 3.625A4.48 4.48 0 0 1 9 11.423V21a1 1 0 1 1-2 0v-9.577A4.48 4.48 0 0 1 3.555 6.5l.453-3.624a1 1 0 0 1 1.116-.868Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconForkKnife
