// solid/general
import type { Component, JSX } from "solid-js"

export const IconFaceOld: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12Zm13.124-3.689a1 1 0 1 0-1.148 1.639l1.23.86a1 1 0 1 0 1.146-1.638zM10.182 9.95a1 1 0 0 0-1.147-1.64l-1.228.86a1 1 0 0 0 1.147 1.64zM7.73 13.886a1 1 0 0 1 1.414.014A4 4 0 0 0 12 15.1c1.12 0 2.13-.458 2.857-1.2a1 1 0 0 1 1.428 1.4A6 6 0 0 1 12 17.1a6 6 0 0 1-4.285-1.8 1 1 0 0 1 .014-1.414Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceOld
