// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconVoiceRecordingDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 16h12"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 6.7A5.15 5.15 0 1 0 6 17 5.15 5.15 0 0 0 6 6.7Z" />
			<path fill="currentColor" d="M18 6.7A5.15 5.15 0 1 0 18 17a5.15 5.15 0 0 0 0-10.3Z" />
		</svg>
	)
}

export default IconVoiceRecordingDuoSolid
