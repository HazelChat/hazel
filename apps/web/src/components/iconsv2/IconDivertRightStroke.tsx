// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDivertRightStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 8.289a20.8 20.8 0 0 1 5.347-.202c.152.014.287.08.386.18m0 0c.1.1.166.234.18.386A20.8 20.8 0 0 1 20.71 14m.023-5.733-7.613 7.612a3 3 0 0 1-4.242 0L2 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconDivertRightStroke
