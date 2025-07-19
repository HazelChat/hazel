// solid/general
import type { Component, JSX } from "solid-js"

export const IconFaceSmile: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12ZM16 9.9a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0zm-6 0a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0zm-2.27 3.986a1 1 0 0 1 1.413.014A4 4 0 0 0 12 15.1c1.12 0 2.13-.458 2.857-1.2a1 1 0 1 1 1.428 1.4A6 6 0 0 1 12 17.1a6 6 0 0 1-4.285-1.8 1 1 0 0 1 .014-1.414Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceSmile
