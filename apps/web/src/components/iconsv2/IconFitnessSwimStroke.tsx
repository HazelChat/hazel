// stroke/sports
import type { Component, JSX } from "solid-js"

export const IconFitnessSwimStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m2 21.19 2.55-1.02c1.55-.62 3.3-.503 4.756.314 1.675.94 3.723.94 5.397-.001a5.5 5.5 0 0 1 4.744-.314L22 21.19"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m2 16.188 2.55-1.02c1.55-.62 3.3-.503 4.756.314 1.675.94 3.723.94 5.397-.001a5.5 5.5 0 0 1 4.744-.314L22 16.188"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.385 7.657a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m13.56 11.44 1.061-1.061-3.533-2.476a2 2 0 0 0-2.349.04L6 10"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessSwimStroke
