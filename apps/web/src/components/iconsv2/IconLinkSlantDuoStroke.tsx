// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconLinkSlantDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m10.586 6.343.707-.707a5 5 0 0 1 7.07 7.07l-.706.708M6.343 10.586l-.707.707a5 5 0 0 0 7.07 7.07l.708-.706"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m14.122 9.879-4.243 4.243"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkSlantDuoStroke
