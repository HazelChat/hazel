// duo-solid/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconSpatialCurvedScreenDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 20.997h-5m-2.99 0H8"
			/>
			<path
				fill="currentColor"
				d="M20.496 2.405A2 2 0 0 1 23 4.383V16.61l-.001.116a2 2 0 0 1-2.503 1.862l-.111-.032-.01-.003-.638-.19a28 28 0 0 0-16.112.19l-.01.003-.111.032a2 2 0 0 1-2.503-1.862L1 16.61V4.383l.001-.116a2 2 0 0 1 2.503-1.862l.111.032.01.003.638.19a28 28 0 0 0 16.112-.19l.01-.003c.034-.01.074-.023.111-.032Z"
				opacity=".35"
			/>
		</svg>
	)
}

export default IconSpatialCurvedScreenDuoSolid
