// solid/maths
import type { Component, JSX } from "solid-js"

export const IconPlusCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12ZM13 8.9a1 1 0 1 0-2 0V11H8.9a1 1 0 1 0 0 2H11v2.1a1 1 0 1 0 2 0V13h2.1a1 1 0 1 0 0-2H13z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPlusCircle
