// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconPaperclipVerticalDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 9v7a6 6 0 0 1-12 0V6a4 4 0 1 1 8 0v10a2 2 0 1 1-4 0V7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 7v9a2 2 0 1 0 4 0V6a4 4 0 0 0-8 0"
				fill="none"
			/>
		</svg>
	)
}

export default IconPaperclipVerticalDuoStroke
