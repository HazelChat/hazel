// contrast/general
import type { Component, JSX } from "solid-js"

export const IconPoll1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path fill="currentColor" d="M9 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				<path fill="currentColor" d="M9 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 7h8M6 7h.01M13 17h8M9 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			/>
		</svg>
	)
}

export default IconPoll1
