// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconNpmLogoSymbolDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.4 20h3.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C20 16.96 20 15.84 20 13.6v-3.2c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 4 15.84 4 13.6 4h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 7.04 4 8.16 4 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C7.04 20 8.16 20 10.4 20Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 11v9"
				fill="none"
			/>
		</svg>
	)
}

export default IconNpmLogoSymbolDuoStroke
