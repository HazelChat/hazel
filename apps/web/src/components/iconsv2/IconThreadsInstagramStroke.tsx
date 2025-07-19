// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconThreadsInstagramStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.5 11.847V11a3.5 3.5 0 0 0-5.95-2.5m5.95 3.347V13a3.5 3.5 0 0 1-3.5 3.5c-2.459 0-4.514-2.781-2.091-4.498 1.41-.999 3.733-.943 5.591-.155Zm0 0c1.087.46 2.015 1.172 2.507 2.07 1.101 2.012.236 4.93-1.69 6.115A8.25 8.25 0 0 1 3.75 13v-2a8.25 8.25 0 0 1 15.723-3.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconThreadsInstagramStroke
