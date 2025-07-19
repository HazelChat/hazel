// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02ArrowLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 11v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h3m9 9v-1a8 8 0 0 0-8-8h-1m9 9a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m-.126 10a10 10 0 0 0-1.77 1.704A.47.47 0 0 0 9 14m1.874 2a10 10 0 0 1-1.77-1.704A.47.47 0 0 1 9 14m0 0h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02ArrowLeftStroke
