// duo-solid/editing
import type { Component, JSX } from "solid-js"

export const IconDrawHighlighterDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M13.707 7.293a1 1 0 0 0-1.262-.125l-3 2A1 1 0 0 0 9 10v2.17A3 3 0 0 0 7 15v2.935a1 1 0 1 0 2 0V15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.935a1 1 0 0 0 2 0V15a3 3 0 0 0-2-2.83V9a1 1 0 0 0-.293-.707z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconDrawHighlighterDuoSolid
