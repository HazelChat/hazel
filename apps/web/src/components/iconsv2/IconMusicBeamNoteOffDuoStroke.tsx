// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconMusicBeamNoteOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 12.077V8.03c0-.805.503-1.527 1.269-1.821l10.683-4.106a1.52 1.52 0 0 1 1.748.484M8 12.077l6.588-2.532M8 12.077v3.913m14 0c0 1.62-1.343 2.935-3 2.935s-3-1.314-3-2.935 1.343-2.935 3-2.935 3 1.314 3 2.935Zm0 0V7.825M7.121 16.85A3.02 3.02 0 0 0 5 15.99c-1.657 0-3 1.314-3 2.935 0 .81.336 1.544.879 2.075"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconMusicBeamNoteOffDuoStroke
