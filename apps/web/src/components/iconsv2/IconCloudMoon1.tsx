// contrast/weather
import type { Component, JSX } from "solid-js"

export const IconCloudMoon1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 8c.729 0 1.412-.195 2-.535V7.5a5.5 5.5 0 0 1-4.105 5.321A4.767 4.767 0 0 1 14.566 21H5.9a3.9 3.9 0 0 1-.419-7.777h.01c.213-2.525 2.15-4.778 4.789-5.163q.363-.053.743-.059A5.5 5.5 0 0 1 16.5 2h.035A4 4 0 0 0 20 8Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.617 14.933a5.5 5.5 0 0 1-.126-1.71m12.404-.401a4.8 4.8 0 0 0-1.45-.97A5.64 5.64 0 0 0 11.024 8m6.872 4.82a4.767 4.767 0 0 1-3.33 8.18H5.9a3.9 3.9 0 0 1-.419-7.777h.01m12.404-.4A5.5 5.5 0 0 0 22 7.5v-.035A4 4 0 0 1 16.535 2H16.5a5.5 5.5 0 0 0-5.477 6m0 0a6 6 0 0 0-.743.06c-2.64.384-4.576 2.637-4.789 5.162"
			/>
		</svg>
	)
}

export default IconCloudMoon1
