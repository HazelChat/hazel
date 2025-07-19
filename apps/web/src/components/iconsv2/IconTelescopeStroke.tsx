// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconTelescopeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.901 14.803 16 21m-8 0 3.099-6.197"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.525 6.262a2 2 0 0 1 1.414-2.45l1.932-.517 2.448 9.136-1.932.518a2 2 0 0 1-2.45-1.414z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m4.513 10.05-1.74.59a1 1 0 0 0-.646 1.206l.55 2.054a1 1 0 0 0 1.162.722l6.154-1.227m-5.48-3.345 11.942-4.048M4.513 10.05 4.098 8.5m13.91 3.297-4.007.8"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTelescopeStroke
