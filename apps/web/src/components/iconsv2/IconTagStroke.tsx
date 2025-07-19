// stroke/general
import type { Component, JSX } from "solid-js"

export const IconTagStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.51 8.512h.02m7.243-2.639 2.421 2.421c1.316 1.317 1.974 1.975 2.334 2.68a5 5 0 0 1 0 4.54c-.36.706-1.018 1.364-2.334 2.68s-1.974 1.974-2.68 2.334a5 5 0 0 1-4.54 0c-.705-.36-1.363-1.018-2.68-2.334l-2.421-2.421c-1.113-1.114-1.67-1.67-2.056-2.323a6 6 0 0 1-.717-1.869c-.15-.743-.108-1.53-.026-3.101l.044-.821c.08-1.525.12-2.287.437-2.878A3 3 0 0 1 4.78 3.555c.59-.317 1.353-.357 2.878-.437l.82-.044c1.573-.082 2.359-.124 3.102.026a6 6 0 0 1 1.869.717c.653.386 1.21.943 2.323 2.056ZM9.49 8.488a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTagStroke
