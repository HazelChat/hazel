// solid/maths
import type { Component, JSX } from "solid-js"

export const IconMultipleCrossCancelCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85c5.605 0 10.15 4.544 10.15 10.15 0 5.605-4.545 10.15-10.15 10.15S1.85 17.606 1.85 12Zm7.757-3.807a1 1 0 1 0-1.414 1.414L10.585 12l-2.392 2.393a1 1 0 1 0 1.414 1.414L12 13.414l2.393 2.393a1 1 0 0 0 1.414-1.414L13.414 12l2.393-2.393a1 1 0 0 0-1.414-1.414L12 10.586z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMultipleCrossCancelCircle
