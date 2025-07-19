// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDivertRight1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.347 8.087A20.8 20.8 0 0 0 15 8.29l1.1.88a24 24 0 0 1 3.73 3.731l.881 1.1c.298-1.779.366-3.576.202-5.347a.624.624 0 0 0-.566-.566Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m2 9 6.879 6.879a3 3 0 0 0 4.242 0l4.947-4.947m0 0A24 24 0 0 0 16.1 9.169L15 8.29a20.8 20.8 0 0 1 5.347-.202.625.625 0 0 1 .566.566A20.8 20.8 0 0 1 20.71 14l-.88-1.1a24 24 0 0 0-1.763-1.968Z"
			/>
		</svg>
	)
}

export default IconDivertRight1
