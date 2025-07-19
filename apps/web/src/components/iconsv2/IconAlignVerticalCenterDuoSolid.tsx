// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignVerticalCenterDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 12h14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.098 5.689a1 1 0 0 0-.932 1.547 17.4 17.4 0 0 0 2.863 3.384c.264.24.607.38.971.38s.707-.14.97-.38a17.4 17.4 0 0 0 2.864-3.384 1 1 0 0 0-.932-1.547q-.95.093-1.902.126V3a1 1 0 1 0-2 0v2.815a30 30 0 0 1-1.902-.126Z"
			/>
			<path
				fill="currentColor"
				d="M8.005 17.414a1 1 0 0 1 .161-.65 17.4 17.4 0 0 1 2.863-3.384c.264-.24.607-.38.971-.38s.707.14.97.38a17.4 17.4 0 0 1 2.864 3.384 1 1 0 0 1-.932 1.547A30 30 0 0 0 13 18.185V21a1 1 0 1 1-2 0v-2.815q-.953.033-1.902.126a1 1 0 0 1-1.093-.897Z"
			/>
		</svg>
	)
}

export default IconAlignVerticalCenterDuoSolid
