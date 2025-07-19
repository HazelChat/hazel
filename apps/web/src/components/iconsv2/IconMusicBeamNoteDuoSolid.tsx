// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconMusicBeamNoteDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 16V7.967L9 12.682V19a1 1 0 1 1-2 0V7.863a3 3 0 0 1 1.903-2.792L19.586.874A2.5 2.5 0 0 1 23 3.201V16a1 1 0 1 1-2 0Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M19 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
			<path fill="currentColor" d="M5 15a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
		</svg>
	)
}

export default IconMusicBeamNoteDuoSolid
