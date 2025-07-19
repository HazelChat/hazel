// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconUturnRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 8H9a5 5 0 0 0 0 10h3"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M14.972 3.99a1 1 0 0 1 1.586-.881 21.8 21.8 0 0 1 4.073 3.856 1.64 1.64 0 0 1 0 2.071 21.8 21.8 0 0 1-4.073 3.856 1 1 0 0 1-1.586-.882l.17-2.32a23 23 0 0 0 0-3.38z"
			/>
		</svg>
	)
}

export default IconUturnRightDuoSolid
