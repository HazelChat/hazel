// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconAnimation02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 14a5 5 0 0 1 5 5v-1a9 9 0 0 1 5.237-8.178"
				opacity=".28"
			/>
			<path fill="currentColor" d="M19 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
		</svg>
	)
}

export default IconAnimation02DuoSolid
