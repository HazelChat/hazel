// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconIpadStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 19h4m0-17v1h-4V2m-.6 20h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 18.96 21 17.84 21 15.6V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 2 16.84 2 14.6 2H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 5.04 3 6.16 3 8.4v7.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 22 7.16 22 9.4 22Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconIpadStroke
