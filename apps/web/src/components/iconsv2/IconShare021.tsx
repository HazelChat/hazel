// contrast/general
import type { Component, JSX } from "solid-js"

export const IconShare021: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M11.409 3.216A20.3 20.3 0 0 0 8 6.856c1.326-.131 2.665-.337 4-.337s2.674.206 4 .337a20.3 20.3 0 0 0-3.409-3.64.92.92 0 0 0-1.182 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 13v1.6c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6V13m9-6.481V16m0-9.481c-1.335 0-2.674.206-4 .337a20.3 20.3 0 0 1 3.409-3.64.92.92 0 0 1 1.182 0A20.3 20.3 0 0 1 16 6.856c-1.326-.131-2.665-.337-4-.337Z"
			/>
		</svg>
	)
}

export default IconShare021
