// stroke/general
import type { Component, JSX } from "solid-js"

export const IconListHeartStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16m-2.286 12.327c-.371 0-3.714-1.806-3.714-4.333 0-1.264 1.114-2.167 2.229-2.167.547 0 1.114.18 1.485.722.372-.541.929-.73 1.486-.722 1.114.016 2.229.903 2.229 2.167 0 2.527-3.343 4.333-3.715 4.333Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconListHeartStroke
