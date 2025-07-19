// stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserLoveHeartStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.402 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h1.215M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1 14.32c-.4 0-4-1.945-4-4.667 0-1.361 1.2-2.333 2.4-2.333.59 0 1.2.194 1.6.777.4-.583 1-.786 1.6-.777 1.2.016 2.4.972 2.4 2.333 0 2.722-3.6 4.666-4 4.666Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserLoveHeartStroke
