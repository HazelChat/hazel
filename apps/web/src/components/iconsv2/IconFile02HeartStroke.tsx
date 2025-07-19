// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02HeartStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m9 8v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Zm-8 7.625c-.35 0-3.5-1.701-3.5-4.083 0-1.191 1.05-2.042 2.1-2.042.516 0 1.05.17 1.4.68.35-.51.875-.687 1.4-.68 1.05.015 2.1.85 2.1 2.042 0 2.382-3.15 4.083-3.5 4.083Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02HeartStroke
