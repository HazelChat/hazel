// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02MusicNoteStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m1 15.5a1.5 1.5 0 1 1-3 .002 1.5 1.5 0 0 1 3-.001Zm0 0v-6.678a.82.82 0 0 1 1.187-.734A3.28 3.28 0 0 1 15 13.023a3.6 3.6 0 0 1-.312 1.477M20 10v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02MusicNoteStroke
