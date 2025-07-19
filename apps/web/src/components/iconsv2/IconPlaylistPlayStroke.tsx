// stroke/media
import type { Component, JSX } from "solid-js"

export const IconPlaylistPlayStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 6h14M7 2.001 17 2M7 22h10c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092C21 20.1 21 19.4 21 18v-4c0-1.4 0-2.1-.273-2.635a2.5 2.5 0 0 0-1.092-1.092C19.1 10 18.4 10 17 10H7c-1.4 0-2.1 0-2.635.273a2.5 2.5 0 0 0-1.093 1.092C3 11.9 3 12.6 3 14v4c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092C4.9 22 5.6 22 7 22Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.485 15.84c0-1.432 0-2.149.3-2.548a1.5 1.5 0 0 1 1.093-.597c.498-.036 1.1.351 2.305 1.125l.162.104c1.045.672 1.567 1.008 1.748 1.436a1.5 1.5 0 0 1 0 1.167c-.18.427-.703.763-1.748 1.435l-.162.104c-1.205.774-1.807 1.162-2.305 1.126a1.5 1.5 0 0 1-1.094-.597c-.3-.4-.3-1.116-.3-2.548z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPlaylistPlayStroke
