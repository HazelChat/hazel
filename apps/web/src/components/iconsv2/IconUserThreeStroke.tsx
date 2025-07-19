// stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserThreeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.092 10.516a4 4 0 0 1 0-7.033M3.029 15.417A3.75 3.75 0 0 0 1 18.75c0 1.036.7 1.91 1.655 2.17m18.69 0A2.25 2.25 0 0 0 23 18.75a3.75 3.75 0 0 0-2.03-3.333m-2.062-4.9a4 4 0 0 0 0-7.033M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM8.25 21h7.5A2.25 2.25 0 0 0 18 18.75 3.75 3.75 0 0 0 14.25 15h-4.5A3.75 3.75 0 0 0 6 18.75 2.25 2.25 0 0 0 8.25 21Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserThreeStroke
