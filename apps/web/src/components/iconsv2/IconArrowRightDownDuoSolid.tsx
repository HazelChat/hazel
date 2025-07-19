// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowRightDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.637 17.637 4.909 4.909"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M18.344 18.344c.306-.306.509-.713.559-1.166a31.2 31.2 0 0 0-.157-8.054 1 1 0 0 0-1.696-.56L8.564 17.05a1 1 0 0 0 .56 1.696c2.672.4 5.38.453 8.054.157a1.95 1.95 0 0 0 1.166-.559Z"
			/>
		</svg>
	)
}

export default IconArrowRightDownDuoSolid
