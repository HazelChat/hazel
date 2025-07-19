// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnDownLeftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.351 15H12c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C20 11.2 20 9.8 20 7V4"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.844 10.17a1 1 0 0 0-1.58-.974 26.2 26.2 0 0 0-4.87 4.684 1.79 1.79 0 0 0 0 2.24 26.2 26.2 0 0 0 4.87 4.684 1 1 0 0 0 1.58-.973A49 49 0 0 1 9.548 18a23 23 0 0 1 0-6c.058-.443.134-.889.296-1.83Z"
			/>
		</svg>
	)
}

export default IconArrowTurnDownLeftDuoSolid
