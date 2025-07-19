// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconClockOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 8v4m6.47-6.47A9.15 9.15 0 0 0 5.53 18.47m3.475 2.179A9.15 9.15 0 0 0 20.648 9.006m-5.86 5.86.211.134"
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

export default IconClockOffDuoStroke
