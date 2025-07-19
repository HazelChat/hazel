// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeftCircleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.606 22.15 12 17.606 1.85 12 1.85 1.85 6.394 1.85 12Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.949 16a20.3 20.3 0 0 1-3.807-3.604A.63.63 0 0 1 8 12m3.949-4a20.3 20.3 0 0 0-3.807 3.604A.63.63 0 0 0 8 12m0 0h8"
			/>
		</svg>
	)
}

export default IconArrowLeftCircleDuoSolid
