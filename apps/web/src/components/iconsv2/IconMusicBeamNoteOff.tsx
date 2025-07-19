// solid/media
import type { Component, JSX } from "solid-js"

export const IconMusicBeamNoteOff: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M19.586 1.173a2.5 2.5 0 0 1 2.158.157c.333-.087.702-.001.963.256a.977.977 0 0 1 0 1.395l-20 19.73a1.01 1.01 0 0 1-1.414 0 .977.977 0 0 1 0-1.395l.261-.258A3.9 3.9 0 0 1 1 19.054c0-2.18 1.79-3.946 4-3.946.728 0 1.412.193 2 .528V8.068a2.96 2.96 0 0 1 1.903-2.755zm-9.097 11.07L9 13.714v-.892z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M21 7.862v4.815a4 4 0 0 0-2-.528c-2.21 0-4 1.766-4 3.946 0 2.179 1.79 3.946 4 3.946s4-1.767 4-3.946V7.862a.993.993 0 0 0-1-.987c-.552 0-1 .442-1 .987Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMusicBeamNoteOff
