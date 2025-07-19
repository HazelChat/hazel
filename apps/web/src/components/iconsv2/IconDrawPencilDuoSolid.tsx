// duo-solid/editing
import type { Component, JSX } from "solid-js"

export const IconDrawPencilDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12a10.15 10.15 0 0 0 20.3 0c0-5.606-4.544-10.15-10.15-10.15Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M12.858 7.487a1 1 0 0 0-1.716 0l-2.989 5-1.01 1.693a1 1 0 0 0-.143.513v3.234a1 1 0 1 0 2 0V14.97l.87-1.456.307-.513h3.646l.307.513.87 1.456v2.958a1 1 0 1 0 2 0v-3.234a1 1 0 0 0-.142-.513l-1.01-1.693z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconDrawPencilDuoSolid
