// contrast/general
import type { Component, JSX } from "solid-js"

export const IconUploadUp1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 6.812a15 15 0 0 1 2.556-2.655.7.7 0 0 1 .888 0A15 15 0 0 1 15 6.812c-.994-.1-2-.262-3-.262s-2.006.162-3 .262Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 15a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5m-9-8.45V15m0-8.45c-1 0-2.006.162-3 .262a15 15 0 0 1 2.556-2.655.7.7 0 0 1 .888 0A15 15 0 0 1 15 6.812c-.994-.1-2-.262-3-.262Z"
			/>
		</svg>
	)
}

export default IconUploadUp1
