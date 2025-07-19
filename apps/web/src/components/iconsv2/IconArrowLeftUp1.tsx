// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeftUp1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.591 6.432a30.2 30.2 0 0 0 .152 7.797l4.03-4.455 4.456-4.03a30.2 30.2 0 0 0-7.797-.153.95.95 0 0 0-.84.84Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m9.774 9.774-4.03 4.455a30.2 30.2 0 0 1-.153-7.797.95.95 0 0 1 .84-.84 30.2 30.2 0 0 1 7.798.151zm0 0 8.817 8.817"
			/>
		</svg>
	)
}

export default IconArrowLeftUp1
