// contrast/automotive
import type { Component, JSX } from "solid-js"

export const IconCycleCycling1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path fill="currentColor" d="M17.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
				<path fill="currentColor" d="M5.5 20.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
				<path fill="currentColor" d="M21.5 17.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m11.5 19.5 1.031-4.123a2 2 0 0 0-1.39-2.409l-1.363-.389c-1.572-.449-1.947-2.51-.66-3.516a3.02 3.02 0 0 1 3.871.124l1.143 1.03a4 4 0 0 0 2.021.975L18 11.5M17.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-13 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
			/>
		</svg>
	)
}

export default IconCycleCycling1
