// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserUser021: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
				<path
					fill="currentColor"
					d="M7.275 21h9.45A3.275 3.275 0 0 0 20 17.725c0-2.286-2.284-3.869-4.424-3.066l-1.926.722a4.7 4.7 0 0 1-3.3 0l-1.926-.722C6.284 13.856 4 15.44 4 17.725A3.275 3.275 0 0 0 7.275 21Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.275 21h9.45A3.275 3.275 0 0 0 20 17.725c0-2.286-2.284-3.869-4.424-3.066l-1.926.722a4.7 4.7 0 0 1-3.3 0l-1.926-.722C6.284 13.856 4 15.44 4 17.725A3.275 3.275 0 0 0 7.275 21Z"
			/>
		</svg>
	)
}

export default IconUserUser021
