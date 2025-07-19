// solid/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconSpatialEnvironment: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.999 4.27a2 2 0 0 0-2.613-1.83l-.011.004c-.328.098-.485.145-.638.189a28 28 0 0 1-16.112-.19l-.01-.003-.111-.031A2 2 0 0 0 1.001 4.27L1 4.386v12.228l.001.115a2 2 0 0 0 2.614 1.83l.01-.003a35 35 0 0 1 1.616-.451 1 1 0 0 0-.482-1.941 37 37 0 0 0-1.708.477l-.05.012-.001-.05V4.347l.058.014a30 30 0 0 0 17.231.194q.2-.058.398-.118L21 4.344v12.312l-.05-.015a37 37 0 0 0-1.709-.477 1 1 0 1 0-.482 1.94c.535.134 1.07.288 1.616.452l.01.003c.034.01.074.023.111.032A2 2 0 0 0 23 16.73l.001-.115V4.386z"
				fill="currentColor"
			/>
			<path
				d="M8 21a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2 1 1 0 1 0 2 0 4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4 1 1 0 1 0 2 0Z"
				fill="currentColor"
			/>
			<path d="M8.75 12.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Z" fill="currentColor" />
		</svg>
	)
}

export default IconSpatialEnvironment
