// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02QuestionMarkStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3M9.85 12.002a2.248 2.248 0 0 1 4.37.75c0 1.499-2.25 2.248-2.25 2.248m.03 3h.01M20 10v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02QuestionMarkStroke
