// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconAlarmOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 3 2 6m12.283 9.37.217.13m4.984-5.332A8 8 0 0 1 9.168 20.484m-3.303-2.35a8 8 0 0 1 11.27-11.27M12 10.001v2m7-9 1 1"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlarmOffDuoStroke
