// stroke/sports
import type { Component, JSX } from "solid-js"

export const IconFitnessRunFastStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m17 20 2.078-2.771a1 1 0 0 0-.575-1.574l-2.76-.637a2 2 0 0 1-1.417-2.667L16 8h-2.528a4 4 0 0 0-3.578 2.211L9 12"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m12.5 17-.906 1.812a5 5 0 0 1-1.699 1.924L8 22"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m19 9.5.02.031a2 2 0 0 0 2.56.68L22 10"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 4H5m1 5H2m5 6H3m2 5H2"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessRunFastStroke
