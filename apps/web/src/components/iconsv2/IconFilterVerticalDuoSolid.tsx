// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconFilterVerticalDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 3v7m0 10v1M7 3v3m0 10v5"
				opacity=".28"
			/>
			<path fill="currentColor" d="M7 5a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V9a4 4 0 0 0-4-4Z" />
			<path fill="currentColor" d="M17 9a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0v-1a4 4 0 0 0-4-4Z" />
		</svg>
	)
}

export default IconFilterVerticalDuoSolid
