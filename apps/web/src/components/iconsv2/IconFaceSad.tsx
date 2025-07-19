// solid/general
import type { Component, JSX } from "solid-js"

export const IconFaceSad: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12c0 5.605-4.544 10.15-10.15 10.15S1.85 17.605 1.85 12ZM10 9.685a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0zm4.852 7.115a1 1 0 1 0 1.428-1.4 6 6 0 0 0-4.284-1.8c-1.679 0-3.197.69-4.285 1.8a1 1 0 1 0 1.428 1.4 4 4 0 0 1 2.857-1.2 3.98 3.98 0 0 1 2.856 1.2ZM15 8.685a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceSad
