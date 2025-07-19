// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconTextCursorAlphabetStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14 22c.93 0 1.395 0 1.777-.102a3 3 0 0 0 2.12-2.122C18 19.396 18 18.93 18 18m0 0c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.122 2.122C20.605 22 21.07 22 22 22m-4-4v-6M14 2c.93 0 1.395 0 1.777.102a3 3 0 0 1 2.12 2.122C18 4.605 18 5.07 18 6m0 0c0-.93 0-1.395.102-1.776a3 3 0 0 1 2.122-2.122C20.605 2 21.07 2 22 2m-4 4v6m0 0h2.009M18 12h-2M2 18 5.632 7.297a1.453 1.453 0 0 1 2.751.044L12 18m-8.303-5h6.606"
				fill="none"
			/>
		</svg>
	)
}

export default IconTextCursorAlphabetStroke
