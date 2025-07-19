// contrast/weather
import type { Component, JSX } from "solid-js"

export const IconCloudRain1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.292 17.24a5.501 5.501 0 0 0-.624-9.796A6.5 6.5 0 0 0 6.017 9.026a4.5 4.5 0 0 0-1.203 8.648l.37-.64A3 3 0 0 1 5 16v-2a3 3 0 0 1 5.529-1.615A3 3 0 0 1 12 12c.535 0 1.037.14 1.471.385A3 3 0 0 1 19 14v2q0 .308-.06.599z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 14v2m4-1v2m4-3v2m-8 3v1m4 0v1m4-2v1M6.017 9.026A7 7 0 0 0 6 9.5m.017-.474a4.5 4.5 0 0 0-1.758 8.377m1.758-8.377a6.5 6.5 0 0 1 12.651-1.582 5.5 5.5 0 0 1 1.252 9.364"
			/>
		</svg>
	)
}

export default IconCloudRain1
