// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconHourglassDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.5 12c0-3.52 6.086-3.889 6.486-7.516a2.32 2.32 0 0 0-.683-1.927C18.718 2 17.376 2 14.691 2H9.31c-2.685 0-4.027 0-4.612.557a2.32 2.32 0 0 0-.683 1.927C4.414 8.111 10.5 8.481 10.5 12"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.5 12c0 3.52 6.086 3.889 6.486 7.516a2.32 2.32 0 0 1-.683 1.927c-.585.557-1.927.557-4.612.557H9.31c-2.685 0-4.027 0-4.612-.557a2.32 2.32 0 0 1-.683-1.927c.4-3.627 6.486-3.997 6.486-7.516"
				fill="none"
			/>
		</svg>
	)
}

export default IconHourglassDuoStroke
