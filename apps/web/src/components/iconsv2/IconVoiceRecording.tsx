// solid/media
import type { Component, JSX } from "solid-js"

export const IconVoiceRecording: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.15 11.85c0 1.187-.401 2.28-1.075 3.15h3.85A5.15 5.15 0 1 1 18 17H6a5.15 5.15 0 1 1 5.15-5.15Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVoiceRecording
