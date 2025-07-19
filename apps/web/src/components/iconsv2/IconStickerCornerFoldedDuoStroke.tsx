// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconStickerCornerFoldedDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h6a8 8 0 0 0 8-8V7a4 4 0 0 0-4-4Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 13a8 8 0 0 1-8 8H9c1.146 0 1.72 0 2.178-.167a2.77 2.77 0 0 0 1.655-1.655C13 18.719 13 18.146 13 17v-1.046c0-1.034 0-1.551.201-1.946.177-.347.46-.63.807-.807.395-.201.912-.201 1.946-.201H17c1.146 0 1.72 0 2.178-.167a2.77 2.77 0 0 0 1.655-1.655C21 10.719 21 10.146 21 9z"
				fill="none"
			/>
		</svg>
	)
}

export default IconStickerCornerFoldedDuoStroke
