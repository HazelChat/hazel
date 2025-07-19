// solid/general
import type { Component, JSX } from "solid-js"

export const IconPowerCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12c0 5.605-4.544 10.15-10.15 10.15S1.85 17.605 1.85 12ZM13 7a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0zM8.799 9.6a1 1 0 0 0-1.6-1.2 6 6 0 1 0 9.6 0 1 1 0 0 0-1.598 1.2 4 4 0 1 1-6.402 0Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPowerCircle
