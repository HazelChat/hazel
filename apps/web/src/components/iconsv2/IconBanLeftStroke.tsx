// stroke/security
import type { Component, JSX } from "solid-js"

export const IconBanLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.53 5.53a9.15 9.15 0 1 1 12.94 12.94M5.53 5.53a9.15 9.15 0 0 0 12.94 12.94M5.53 5.53l12.94 12.94"
				fill="none"
			/>
		</svg>
	)
}

export default IconBanLeftStroke
