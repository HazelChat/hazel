// stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserSpeakingStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 4c.375.926.581 1.94.581 3s-.206 2.074-.581 3m2.8-8c.767 1.5 1.2 3.2 1.2 5s-.433 3.5-1.2 5M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-8 8h8a4 4 0 0 1 4 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 4 4 0 0 1 4-4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserSpeakingStroke
