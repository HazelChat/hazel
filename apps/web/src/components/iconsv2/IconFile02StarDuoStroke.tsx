// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02StarDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 2a8 8 0 0 1 8 8v1a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 11c.004.1.005.151.008.195a3 3 0 0 0 2.797 2.797L15 14c-.1.004-.151.005-.195.008a3 3 0 0 0-2.797 2.797L12 17c-.004-.1-.005-.151-.008-.195a3 3 0 0 0-2.797-2.797L9 14c.1-.004.151-.005.195-.008a3 3 0 0 0 2.797-2.797z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02StarDuoStroke
