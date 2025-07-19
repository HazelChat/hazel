// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowRightDownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.999 18.484a30.2 30.2 0 0 0 7.797.152.95.95 0 0 0 .568-.272m.12-8.365a30.2 30.2 0 0 1 .152 7.797.95.95 0 0 1-.272.568m0 0L5.636 5.636"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowRightDownStroke
