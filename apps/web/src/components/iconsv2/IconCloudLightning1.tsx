// contrast/weather
import type { Component, JSX } from "solid-js"

export const IconCloudLightning1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m18.34 17.685-.422-.309a3.4 3.4 0 0 0-.426-1.721c-.573-1.033-1.57-1.61-2.548-1.768l-.198-.032.795-1.168a3 3 0 0 0-4.962-3.374l-3.041 4.473a3.38 3.38 0 0 0-.162 3.646L6.96 18H6.5a4.5 4.5 0 0 1-.483-8.974 6.5 6.5 0 0 1 12.651-1.582 5.501 5.501 0 0 1-.329 10.241Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.06 11 10 15.5c-.201.272-.01.623.374.685l4.09.664c.38.061.573.408.377.68L11.365 22M6.017 9.026A6.6 6.6 0 0 0 6.174 11m-.157-1.974A4.5 4.5 0 0 0 6.5 18h.05m-.533-8.974a6.5 6.5 0 0 1 12.651-1.582A5.5 5.5 0 0 1 22 12.5c0 2.07-1.21 4.033-3.076 4.937"
			/>
		</svg>
	)
}

export default IconCloudLightning1
