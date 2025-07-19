// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDoubleChevronUp1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M11.702 7.106A20.4 20.4 0 0 0 8 11l4-.3 4 .3a20.4 20.4 0 0 0-3.702-3.894.47.47 0 0 0-.596 0Z"
				/>
				<path
					fill="currentColor"
					d="M11.702 13.106A20.4 20.4 0 0 0 8 17l4-.3 4 .3a20.4 20.4 0 0 0-3.702-3.894.47.47 0 0 0-.596 0Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.702 7.106A20.4 20.4 0 0 0 8 11l4-.3 4 .3a20.4 20.4 0 0 0-3.702-3.894.47.47 0 0 0-.596 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.702 13.106A20.4 20.4 0 0 0 8 17l4-.3 4 .3a20.4 20.4 0 0 0-3.702-3.894.47.47 0 0 0-.596 0Z"
			/>
		</svg>
	)
}

export default IconDoubleChevronUp1
