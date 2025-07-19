// solid/editing
import type { Component, JSX } from "solid-js"

export const IconDrawHighlighter: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12c0 5.605-4.544 10.15-10.15 10.15S1.85 17.605 1.85 12Zm10.595-4.832a1 1 0 0 1 1.262.125l1 1A1 1 0 0 1 15 9v3.17c1.165.413 2 1.524 2 2.83v2.935a1 1 0 0 1-2 0V15a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2.935a1 1 0 1 1-2 0V15c0-1.306.835-2.417 2-2.83V10a1 1 0 0 1 .445-.832z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDrawHighlighter
