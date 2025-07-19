// stroke/general
import type { Component, JSX } from "solid-js"

export const IconAwardMedalStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.365 14.472 18 22c-4.286-2.664-7.714-2.664-12 0l1.635-7.528m8.73 0a7 7 0 1 0-8.73 0m8.73 0A6.97 6.97 0 0 1 12 16a6.97 6.97 0 0 1-4.365-1.528"
				fill="none"
			/>
		</svg>
	)
}

export default IconAwardMedalStroke
