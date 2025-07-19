// contrast/alerts
import type { Component, JSX } from "solid-js"

export const IconInformationCircle1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 12v4m0-7.375zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
		</svg>
	)
}

export default IconInformationCircle1
