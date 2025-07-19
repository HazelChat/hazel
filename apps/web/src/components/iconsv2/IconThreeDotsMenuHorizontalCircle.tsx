// solid/general
import type { Component, JSX } from "solid-js"

export const IconThreeDotsMenuHorizontalCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12c0 5.605-4.544 10.15-10.15 10.15S1.85 17.605 1.85 12ZM8 10.9a1.1 1.1 0 0 0 0 2.2h.01a1.1 1.1 0 0 0 0-2.2zm4 0a1.1 1.1 0 0 0 0 2.2h.01a1.1 1.1 0 0 0 0-2.2zm4 0a1.1 1.1 0 0 0 0 2.2h.01a1.1 1.1 0 0 0 0-2.2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuHorizontalCircle
