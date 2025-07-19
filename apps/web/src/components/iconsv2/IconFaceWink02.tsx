// solid/general
import type { Component, JSX } from "solid-js"

export const IconFaceWink02: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12ZM9 8.9a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm5.6.5a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2zm-5.457 4.5a1 1 0 0 0-1.428 1.4A6 6 0 0 0 12 17.1c1.678 0 3.197-.69 4.285-1.8a1 1 0 1 0-1.428-1.4A4 4 0 0 1 12 15.1c-1.12 0-2.13-.458-2.857-1.2Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceWink02
