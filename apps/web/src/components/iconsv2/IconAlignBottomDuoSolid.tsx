// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignBottomDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 20h14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13 4a1 1 0 1 0-2 0v7.124a50 50 0 0 1-3.003-.152 1 1 0 0 0-.886 1.59 21.8 21.8 0 0 0 3.853 4.069 1.64 1.64 0 0 0 2.072 0 21.8 21.8 0 0 0 3.852-4.069 1 1 0 0 0-.886-1.59q-1.499.122-3.002.152z"
			/>
		</svg>
	)
}

export default IconAlignBottomDuoSolid
