// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconCommandCmdKDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4.667 13.833H2.833a1.833 1.833 0 1 0 1.834 1.834z"
					fill="none"
				/>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10.167 13.833H8.333v1.834a1.833 1.833 0 1 0 1.834-1.834Z"
					fill="none"
				/>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8.333 8.333v1.834h1.834a1.833 1.833 0 1 0-1.834-1.834Z"
					fill="none"
				/>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M2.833 10.167h1.834V8.333a1.833 1.833 0 1 0-1.834 1.834Z"
					fill="none"
				/>
			</g>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 6.5V14m0 0v3.5m0-3.5 2.041-2.041m0 0L22.922 6.5m-4.88 5.459a8.86 8.86 0 0 1 4.84 5.201l.118.34M4.667 13.833h3.666v-3.666H4.667z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCommandCmdKDuoStroke
