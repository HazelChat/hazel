// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconFaceSmileDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M15 8.9a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
			<path fill="currentColor" d="M9 8.901a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
			<path
				fill="currentColor"
				d="M9.143 13.9a1 1 0 0 0-1.428 1.4A6 6 0 0 0 12 17.1c1.678 0 3.197-.69 4.285-1.8a1 1 0 1 0-1.428-1.4A4 4 0 0 1 12 15.1c-1.12 0-2.13-.457-2.857-1.2Z"
			/>
		</svg>
	)
}

export default IconFaceSmileDuoSolid
