// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveArrowLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 8.5h16m-16 0v9a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-9m-16 0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.41 17.57a13 13 0 0 1-2.275-2.19A.6.6 0 0 1 9 15m0 0c0-.139.048-.274.135-.381a13 13 0 0 1 2.275-2.19M9 14.999h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconArchiveArrowLeftStroke
