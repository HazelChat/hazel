// stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserArrowLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.4 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4.4m5.411 6a15 15 0 0 1-2.654-2.556A.7.7 0 0 1 15 18m2.811-3a15 15 0 0 0-2.654 2.556A.7.7 0 0 0 15 18m0 0h7M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserArrowLeftStroke
