// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconScissorsLeftCutStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m5.292 19.264 7.388-7.389m0 0L5.292 4.486m7.388 7.389 3.039 3.039m-3.039-3.039 3.039-3.039m0 6.078a3.167 3.167 0 1 1 4.478 4.478 3.167 3.167 0 0 1-4.478-4.478Zm0-6.078a3.167 3.167 0 1 1 4.478-4.478 3.167 3.167 0 0 1-4.478 4.478Zm-8.844 3.039h1m-5 0h1"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsLeftCutStroke
