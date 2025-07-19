// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignUpStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 12.03a20.8 20.8 0 0 0-3.679-3.885.64.64 0 0 0-.404-.145m-4.084 4.03a20.8 20.8 0 0 1 3.68-3.885.64.64 0 0 1 .404-.145m0 0v12M19 4H5"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignUpStroke
