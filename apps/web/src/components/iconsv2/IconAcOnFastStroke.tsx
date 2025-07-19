// stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconAcOnFastStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 8h-2m-4 7v5m5-5v.146A5.43 5.43 0 0 0 20 20M7 15v.146A5.43 5.43 0 0 1 4 20m18-8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcOnFastStroke
