// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserUser011: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path fill="currentColor" d="M17 15H7a3 3 0 1 0 0 6h10a3 3 0 1 0 0-6Z" />
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
				d="M17 15H7a3 3 0 1 0 0 6h10a3 3 0 1 0 0-6Z"
			/>
		</svg>
	)
}

export default IconUserUser011
