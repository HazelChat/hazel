// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnUpRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.649 9H11c-2.8 0-4.2 0-5.27.545a5 5 0 0 0-2.185 2.185C3 12.8 3 14.2 3 17v3"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13.156 13.83a1 1 0 0 0 1.58.974 26.2 26.2 0 0 0 4.87-4.684 1.79 1.79 0 0 0 0-2.24 26.2 26.2 0 0 0-4.87-4.684 1 1 0 0 0-1.58.973c.162.942.238 1.388.296 1.831a23 23 0 0 1 0 6 49 49 0 0 1-.296 1.83Z"
			/>
		</svg>
	)
}

export default IconArrowTurnUpRightDuoSolid
