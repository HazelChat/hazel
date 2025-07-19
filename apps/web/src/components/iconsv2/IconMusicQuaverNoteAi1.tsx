// contrast/ai
import type { Component, JSX } from "solid-js"

export const IconMusicQuaverNoteAi1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M8 18.998a3 3 0 1 1 6.002-.001A3 3 0 0 1 8 18.998Z" />
				<path
					fill="currentColor"
					d="M7 4c.638 1.616 1.34 2.345 3 3-1.66.655-2.362 1.384-3 3-.638-1.616-1.34-2.345-3-3 1.66-.655 2.362-1.384 3-3Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 20 8.046 7.07 7.07 0 0 1 18.819 12M14 18.998a3 3 0 1 1-3-3.002 3 3 0 0 1 3 3.002ZM3 11h.01M7 4c-.638 1.616-1.34 2.345-3 3 1.66.655 2.362 1.384 3 3 .638-1.616 1.34-2.345 3-3-1.66-.655-2.362-1.384-3-3Z"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteAi1
