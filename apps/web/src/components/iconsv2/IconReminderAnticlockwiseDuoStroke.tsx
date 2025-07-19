// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconReminderAnticlockwiseDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.07 3.693a15 15 0 0 0-.487 3.84c0 .339.284.448.56.51h.001m3.66.348a15 15 0 0 1-3.66-.348m0 0a8 8 0 1 1-1.06 5.908"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m14 15-1.707-1.707a1 1 0 0 1-.293-.707V9"
				fill="none"
			/>
		</svg>
	)
}

export default IconReminderAnticlockwiseDuoStroke
