// stroke/general
import type { Component, JSX } from "solid-js"

export const IconCheckTickCircleBrokenStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m21.035 5.403-.793.541a25.64 25.64 0 0 0-7.798 8.447l-.36.629L8.61 11M21 10.336a9.15 9.15 0 0 1-16.365 7.092A9.15 9.15 0 0 1 16.254 3.897"
				fill="none"
			/>
		</svg>
	)
}

export default IconCheckTickCircleBrokenStroke
