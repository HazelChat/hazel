// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconQueueDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 15h18M3 20h18"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 3a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z" />
		</svg>
	)
}

export default IconQueueDuoSolid
