// contrast/media
import type { Component, JSX } from "solid-js"

export const IconMusicQuaverNote1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M6 18.998a3 3 0 1 1 6.002-.001A3 3 0 0 1 6 18.998Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 18 8.046 7.07 7.07 0 0 1 16.819 12M12 18.998a3 3 0 1 1-3-3.002 3 3 0 0 1 3 3.002Z"
			/>
		</svg>
	)
}

export default IconMusicQuaverNote1
