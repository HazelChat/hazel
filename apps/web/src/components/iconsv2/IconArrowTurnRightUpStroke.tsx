// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnRightUpStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 8.859a25.2 25.2 0 0 0-4.505-4.684A.8.8 0 0 0 15 4m-5 4.859a25.2 25.2 0 0 1 4.505-4.684A.8.8 0 0 1 15 4m0 0v8c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C11.2 20 9.8 20 7 20H4"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnRightUpStroke
