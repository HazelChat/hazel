// duo-stroke/ai
import type { Component, JSX } from "solid-js"

export const IconMusicQuaverNoteAiDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 20 8.046 7.07 7.07 0 0 1 18.819 12"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 11h.01M7 4c-.638 1.616-1.34 2.345-3 3 1.66.655 2.362 1.384 3 3 .638-1.616 1.34-2.345 3-3-1.66-.655-2.362-1.384-3-3Zm7 14.998a3 3 0 1 1-3-3.002 3 3 0 0 1 3 3.002Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteAiDuoStroke
