// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconTerminalConsoleCircleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8 13 2-2-2-2m5 4h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconTerminalConsoleCircleDuoStroke
