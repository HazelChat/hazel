// duo-stroke/alerts
import type { Component, JSX } from "solid-js"

export const IconNotificationBellOnDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.818 9.609a7.207 7.207 0 0 1 14.365 0l.355 4.262c.043.515.206.993.367 1.479a1.587 1.587 0 0 1-1.33 2.077 59.5 59.5 0 0 1-13.149 0 1.587 1.587 0 0 1-1.33-2.08c.161-.485.324-.963.367-1.478z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M8.193 18.672q.459.029.918.05a61 61 0 0 0 6.698-.05 3.843 3.843 0 0 1-7.616 0ZM12 20a1.84 1.84 0 0 1-1.74-1.234q1.74.051 3.479 0A1.84 1.84 0 0 1 12 20Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconNotificationBellOnDuoStroke
