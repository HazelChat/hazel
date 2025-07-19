// contrast/media
import type { Component, JSX } from "solid-js"

export const IconMusicBeamNote1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path
					fill="currentColor"
					d="m9.269 6.002 10.683-4.197A1.5 1.5 0 0 1 22 3.2v3.3L8 12V7.863a2 2 0 0 1 1.269-1.861Z"
				/>
				<path fill="currentColor" d="M19 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
				<path fill="currentColor" d="M5 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 12V7.863a2 2 0 0 1 1.269-1.861l10.683-4.197A1.5 1.5 0 0 1 22 3.2v3.3M8 12v7m0-7 14-5.5M8 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM22 6.5V16m0 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			/>
		</svg>
	)
}

export default IconMusicBeamNote1
