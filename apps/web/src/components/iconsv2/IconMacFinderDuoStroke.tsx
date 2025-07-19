// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconMacFinderDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C18.2 3 16.8 3 14 3h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 21 7.2 21 10 21h4c.618 0 1.168 0 1.662-.006 1.74-.02 2.775-.114 3.608-.539a5 5 0 0 0 2.185-2.185C22 17.2 22 15.8 22 13Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 8v1m10-1v1m0 7a9.8 9.8 0 0 1-1.855.888m0 0a9.4 9.4 0 0 1-3.145.54A9.5 9.5 0 0 1 7 16m8.145.888a41 41 0 0 0 .517 4.106m-.517-4.106A51 51 0 0 1 15 13h-4c0-3.569.779-6.956 2.176-10"
				fill="none"
			/>
		</svg>
	)
}

export default IconMacFinderDuoStroke
