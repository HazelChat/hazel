// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconBlurStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
				fill="none"
			/>
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 4h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 20h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M15 4h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M15 20h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M20 15h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M20 9h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4 9h.01" fill="none" />
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4 15h.01" fill="none" />
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBlurStroke
