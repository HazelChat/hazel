// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconTicketTokenOneDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 4H6a4 4 0 0 0-4 4v.4a.6.6 0 0 0 .6.6A2.4 2.4 0 0 1 5 11.4v1.2A2.4 2.4 0 0 1 2.6 15a.6.6 0 0 0-.6.6v.4a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-.4a.6.6 0 0 0-.6-.6 2.4 2.4 0 0 1-2.4-2.4v-1.2A2.4 2.4 0 0 1 21.4 9a.6.6 0 0 0 .6-.6V8a4 4 0 0 0-4-4Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 15V9.376c-.676.166-1.193.631-1.5 1.245m1.5 4.377h-2m2 0h2"
				fill="none"
			/>
		</svg>
	)
}

export default IconTicketTokenOneDuoStroke
