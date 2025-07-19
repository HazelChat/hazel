// contrast/general
import type { Component, JSX } from "solid-js"

export const IconShare011: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".23">
				<path fill="currentColor" d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
				<path fill="currentColor" d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
				<path fill="currentColor" d="M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.41 6.51c-2.583.773-4.924 2.033-6.82 3.98m6.82 7c-2.583-.773-4.925-2.033-6.82-3.98M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			/>
		</svg>
	)
}

export default IconShare011
