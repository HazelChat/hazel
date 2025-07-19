// stroke/media
import type { Component, JSX } from "solid-js"

export const IconAudioBars01Stroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 10v4m4.5-7v10M21 10v4M12 3v18m4.5-14v10"
				fill="none"
			/>
		</svg>
	)
}

export default IconAudioBars01Stroke
