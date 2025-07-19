// stroke/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalFileStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 6.332v6m2.598-4.5-5.196 3m5.196 0-5.196-3M9 17h6M2 8h2m-2 8h2m7 6h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73C3 5.8 3 7.2 3 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicalFileStroke
