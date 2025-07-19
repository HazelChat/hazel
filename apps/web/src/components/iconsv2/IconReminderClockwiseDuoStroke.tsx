// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconReminderClockwiseDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.93 3.396c.328 1.254.492 2.545.488 3.84-.001.338-.284.448-.56.509h-.002m-3.66.348a15 15 0 0 0 3.66-.348m0 0a8 8 0 1 0 1.06 5.908"
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

export default IconReminderClockwiseDuoStroke
