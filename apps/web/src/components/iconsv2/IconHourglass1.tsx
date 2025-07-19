// contrast/time
import type { Component, JSX } from "solid-js"

export const IconHourglass1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M10.5 12c0-3.52-6.086-3.889-6.486-7.516a2.32 2.32 0 0 1 .683-1.927C5.282 2 6.624 2 9.309 2h5.382c2.685 0 4.027 0 4.612.557a2.32 2.32 0 0 1 .683 1.927C19.586 8.111 13.5 8.481 13.5 12s6.086 3.889 6.486 7.516a2.32 2.32 0 0 1-.683 1.927c-.585.557-1.927.557-4.612.557H9.31c-2.685 0-4.027 0-4.612-.557a2.32 2.32 0 0 1-.683-1.927c.4-3.627 6.486-3.997 6.486-7.516Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.5 12c0-3.52-6.086-3.889-6.486-7.516a2.32 2.32 0 0 1 .683-1.927C5.282 2 6.624 2 9.309 2h5.382c2.685 0 4.027 0 4.612.557a2.32 2.32 0 0 1 .683 1.927C19.586 8.111 13.5 8.481 13.5 12s6.086 3.889 6.486 7.516a2.32 2.32 0 0 1-.683 1.927c-.585.557-1.927.557-4.612.557H9.31c-2.685 0-4.027 0-4.612-.557a2.32 2.32 0 0 1-.683-1.927c.4-3.627 6.486-3.997 6.486-7.516Z"
			/>
		</svg>
	)
}

export default IconHourglass1
