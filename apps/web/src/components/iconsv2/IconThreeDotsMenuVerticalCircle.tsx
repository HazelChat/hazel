// solid/general
import type { Component, JSX } from "solid-js"

export const IconThreeDotsMenuVerticalCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85c5.606 0 10.15 4.544 10.15 10.15 0 5.605-4.544 10.15-10.15 10.15S1.85 17.605 1.85 12 6.394 1.85 12 1.85ZM13.1 8a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 0 0 2.2 0zm0 4a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 0 0 2.2 0zm0 4a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 0 0 2.2 0z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuVerticalCircle
