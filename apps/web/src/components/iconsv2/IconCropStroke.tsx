// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconCropStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 18h8.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C18 16.48 18 15.92 18 14.8V6M6 18H2m4 0v4m0-4V9.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 6 8.08 6 9.2 6H18m0-4v4m0 0h4"
				fill="none"
			/>
		</svg>
	)
}

export default IconCropStroke
