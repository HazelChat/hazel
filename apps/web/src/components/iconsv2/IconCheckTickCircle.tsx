// solid/general
import type { Component, JSX } from "solid-js"

export const IconCheckTickCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12Zm14.214-1.328a1 1 0 1 0-1.128-1.652l-.101.07a16 16 0 0 0-4.174 4.168l-1.454-1.453a1 1 0 0 0-1.414 1.415l2.341 2.339a1 1 0 0 0 1.575-.211 14 14 0 0 1 4.254-4.607z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCheckTickCircle
