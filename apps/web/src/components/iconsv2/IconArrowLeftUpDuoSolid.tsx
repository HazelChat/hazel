// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeftUpDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m6.363 6.363 12.728 12.728"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M5.656 5.656a1.95 1.95 0 0 0-.559 1.166 31.2 31.2 0 0 0 .157 8.055 1 1 0 0 0 1.696.559l8.486-8.486a1 1 0 0 0-.56-1.696c-2.672-.4-5.38-.452-8.054-.157-.453.05-.86.253-1.166.56Z"
			/>
		</svg>
	)
}

export default IconArrowLeftUpDuoSolid
