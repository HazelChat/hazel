// contrast/general
import type { Component, JSX } from "solid-js"

export const IconPlanetRing1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18.34 7.12c2.432-.813 4.11-1.051 4.38-.512.497.987-3.9 4.2-9.821 7.179s-11.123 4.592-11.62 3.605c-.27-.54.92-1.744 3.022-3.212m14.038-7.06A8 8 0 0 0 4.3 14.18m14.04-7.06A8 8 0 1 1 4.3 14.18"
			/>
		</svg>
	)
}

export default IconPlanetRing1
