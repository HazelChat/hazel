// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconExchange02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.798 9H20M8.202 15H4"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M17.028 5.075a1 1 0 0 0-1.578-.89 21.6 21.6 0 0 0-4.074 3.78 1.62 1.62 0 0 0 0 2.07 21.6 21.6 0 0 0 4.074 3.78 1 1 0 0 0 1.578-.89l-.165-2.2a23 23 0 0 1 0-3.45z"
			/>
			<path
				fill="currentColor"
				d="M6.972 11.075a1 1 0 0 1 1.578-.89 21.6 21.6 0 0 1 4.074 3.78 1.62 1.62 0 0 1 0 2.07 21.6 21.6 0 0 1-4.074 3.78 1 1 0 0 1-1.578-.89l.165-2.2a23 23 0 0 0 0-3.45z"
			/>
		</svg>
	)
}

export default IconExchange02DuoSolid
