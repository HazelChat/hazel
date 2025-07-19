// duo-solid/editing
import type { Component, JSX } from "solid-js"

export const IconTextParagraphDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 3v18"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.03 2a7.03 7.03 0 1 0 0 14.058H12V21a1 1 0 0 0 2 0V4h7a1 1 0 1 0 0-2z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconTextParagraphDuoSolid
