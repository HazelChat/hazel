// duo-stroke/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalFileDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 8h2m-2 8h2m7-14h2c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C21 5.8 21 7.2 21 10v4c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C17.2 22 15.8 22 13 22h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C3 18.2 3 16.8 3 14v-4c0-2.8 0-4.2.545-5.27A5 5 0 0 1 5.73 2.545C6.8 2 8.2 2 11 2Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 6.332v3m0 0v3m0-3 2.598-1.5M12 9.332l-2.597 1.5M12 9.332l2.598 1.5m-2.599-1.5-2.597-1.5M9 17h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicalFileDuoStroke
