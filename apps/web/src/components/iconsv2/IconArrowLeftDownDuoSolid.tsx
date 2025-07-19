// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeftDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.363 17.637 19.091 4.909"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M5.656 18.344a1.95 1.95 0 0 1-.559-1.166 31.2 31.2 0 0 1 .157-8.054 1 1 0 0 1 1.696-.56l8.486 8.486a1 1 0 0 1-.56 1.696c-2.672.4-5.38.453-8.054.157a1.95 1.95 0 0 1-1.166-.559Z"
			/>
		</svg>
	)
}

export default IconArrowLeftDownDuoSolid
