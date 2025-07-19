// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconUturnUpStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.083 8.03a20.8 20.8 0 0 0-3.678-3.885A.64.64 0 0 0 16 4m-4.083 4.03a20.8 20.8 0 0 1 3.678-3.885A.64.64 0 0 1 16 4m0 0v11a5 5 0 0 1-10 0v-3"
				fill="none"
			/>
		</svg>
	)
}

export default IconUturnUpStroke
