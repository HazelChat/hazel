// solid/editing
import type { Component, JSX } from "solid-js"

export const IconDrawPencil: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M.85 11C.85 5.394 5.394.85 11 .85S21.15 5.394 21.15 11a10.15 10.15 0 1 1-20.3 0ZM11 6a1 1 0 0 1 .858.487l2.99 5 1.01 1.693a1 1 0 0 1 .142.513v3.234a1 1 0 0 1-2 0V13.97l-.87-1.456-.307-.513H9.177l-.307.513L8 13.97v2.958a1 1 0 1 1-2 0v-3.234a1 1 0 0 1 .142-.513l1.012-1.693 2.988-5A1 1 0 0 1 11 6Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDrawPencil
