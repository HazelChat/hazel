// stroke/building
import type { Component, JSX } from "solid-js"

export const IconPoolLadderStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m2 20.415 2.55-1.02c1.55-.62 3.3-.503 4.756.313 1.675.94 3.723.94 5.397 0a5.5 5.5 0 0 1 4.744-.314L22 20.414"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18.972V6a2 2 0 1 1 4 0v.2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 19.159V6a2 2 0 1 1 4 0v.2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 10h10"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 15h10"
				fill="none"
			/>
		</svg>
	)
}

export default IconPoolLadderStroke
