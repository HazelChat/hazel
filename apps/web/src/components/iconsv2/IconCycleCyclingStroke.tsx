// stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconCycleCyclingStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m11.5 19.5 1.031-4.123a2 2 0 0 0-1.39-2.408l-1.363-.39c-1.572-.449-1.947-2.51-.66-3.516a3.02 3.02 0 0 1 3.871.124l1.143 1.03a4 4 0 0 0 2.021.975L18 11.5M17.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-13 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCycleCyclingStroke
