// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignLeftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 5v14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M20 13a1 1 0 1 0 0-2h-7.124q.03-1.503.152-3.003a1 1 0 0 0-1.59-.886 21.8 21.8 0 0 0-4.069 3.853 1.64 1.64 0 0 0 0 2.072 21.8 21.8 0 0 0 4.069 3.853 1 1 0 0 0 1.59-.886q-.122-1.5-.152-3.003z"
			/>
		</svg>
	)
}

export default IconAlignLeftDuoSolid
