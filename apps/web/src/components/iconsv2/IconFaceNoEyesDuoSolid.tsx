// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconFaceNoEyesDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M7.73 13.886a1 1 0 0 1 1.413.014A4 4 0 0 0 12 15.1c1.12 0 2.13-.459 2.857-1.2a1 1 0 0 1 1.428 1.4A6 6 0 0 1 12 17.1a6 6 0 0 1-4.285-1.8 1 1 0 0 1 .014-1.415Z"
			/>
		</svg>
	)
}

export default IconFaceNoEyesDuoSolid
