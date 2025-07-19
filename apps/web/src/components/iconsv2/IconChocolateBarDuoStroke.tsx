// duo-stroke/food
import type { Component, JSX } from "solid-js"

export const IconChocolateBarDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.211 2a5 5 0 0 0 4.818 3.422A3 3 0 0 0 19 8v11.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 19.5v-15A2.5 2.5 0 0 1 7.5 2z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M4 8h7V1h.211a1 1 0 0 1 .95.685c.178.537.466 1.023.839 1.431V8h7v2h-7v4h7v2h-7v7h-2v-7H4v-2h7v-4H4z"
			/>
		</svg>
	)
}

export default IconChocolateBarDuoStroke
