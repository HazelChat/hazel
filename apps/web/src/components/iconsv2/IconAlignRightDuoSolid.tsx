// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 5v14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M5 13a1 1 0 1 1 0-2h7.124a50 50 0 0 0-.152-3.003 1 1 0 0 1 1.59-.886 21.8 21.8 0 0 1 4.069 3.853 1.64 1.64 0 0 1 0 2.072 21.8 21.8 0 0 1-4.069 3.853 1 1 0 0 1-1.59-.886q.122-1.5.152-3.003z"
			/>
		</svg>
	)
}

export default IconAlignRightDuoSolid
