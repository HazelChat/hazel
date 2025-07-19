// stroke/general
import type { Component, JSX } from "solid-js"

export const IconExchangeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 15.812a15 15 0 0 0-2.556-2.654A.7.7 0 0 0 7 13m-3 2.812a15 15 0 0 1 2.557-2.654A.7.7 0 0 1 7 13m0 0v8M20 8.19a15 15 0 0 1-2.556 2.654A.7.7 0 0 1 17 11m-3-2.81a15 15 0 0 0 2.557 2.654.7.7 0 0 0 .443.157m0 0V3M7 2.85a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Zm10 12a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconExchangeStroke
