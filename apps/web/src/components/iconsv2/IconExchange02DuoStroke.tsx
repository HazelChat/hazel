// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconExchange02DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 9h8m-8 6H4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.031 5a20.6 20.6 0 0 0-3.886 3.604.62.62 0 0 0 0 .792A20.6 20.6 0 0 0 16.031 13m-8.062-2a20.6 20.6 0 0 1 3.886 3.604.62.62 0 0 1 0 .792A20.6 20.6 0 0 1 7.97 19"
				fill="none"
			/>
		</svg>
	)
}

export default IconExchange02DuoStroke
