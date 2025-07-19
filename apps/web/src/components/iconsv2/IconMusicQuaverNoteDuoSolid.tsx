// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconMusicQuaverNoteDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 18 8.046 7.07 7.07 0 0 1 16.819 12"
				opacity=".28"
			/>
			<path fill="currentColor" d="M9 14.997a4 4 0 0 0-4 4.001 4 4 0 1 0 4-4.001Z" />
		</svg>
	)
}

export default IconMusicQuaverNoteDuoSolid
