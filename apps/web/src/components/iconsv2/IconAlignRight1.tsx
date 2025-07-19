// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignRight1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.855 12.404a20.8 20.8 0 0 1-3.886 3.68c.22-2.718.22-5.45 0-8.167a20.8 20.8 0 0 1 3.886 3.678.64.64 0 0 1 0 .81Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.134 12H4m8.134 0a51 51 0 0 1-.165 4.083 20.8 20.8 0 0 0 3.886-3.678.64.64 0 0 0 0-.81 20.8 20.8 0 0 0-3.886-3.678q.165 2.038.165 4.083ZM20 19V5"
			/>
		</svg>
	)
}

export default IconAlignRight1
