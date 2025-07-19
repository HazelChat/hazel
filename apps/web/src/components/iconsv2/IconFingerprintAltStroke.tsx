// stroke/security
import type { Component, JSX } from "solid-js"

export const IconFingerprintAltStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-width="2"
				d="M17.5 3.647A9.95 9.95 0 0 0 12 2a9.95 9.95 0 0 0-5.5 1.647M17 20.662A9.96 9.96 0 0 1 12 22a9.96 9.96 0 0 1-5-1.338"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-width="2"
				d="M4 8.692c2.006-1.931 4.848-3.136 8-3.136s5.994 1.205 8 3.136"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-width="2"
				d="M5.071 17c-.95-5.261 2.72-8 6.93-8a6.99 6.99 0 0 1 5.553 2.739c2.43 3.161-1.613 6.435-3.997 2.602-1.099-1.766-3.495-1.596-4.527-.495C7.934 15.015 8.015 17.9 11 18.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconFingerprintAltStroke
