// stroke/general
import type { Component, JSX } from "solid-js"

export const IconTicketTokenOneStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 15V9.378c-.676.165-1.193.63-1.5 1.244M12 15h-2m2 0h2M2.6 9a.6.6 0 0 1-.6-.6V8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v.4a.6.6 0 0 1-.6.6 2.4 2.4 0 0 0-2.4 2.4v1.2a2.4 2.4 0 0 0 2.4 2.4.6.6 0 0 1 .6.6v.4a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-.4a.6.6 0 0 1 .6-.6A2.4 2.4 0 0 0 5 12.6v-1.2A2.4 2.4 0 0 0 2.6 9Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTicketTokenOneStroke
