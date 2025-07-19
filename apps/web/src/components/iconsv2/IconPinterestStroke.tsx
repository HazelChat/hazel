// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconPinterestStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.141 14.374a7.918 7.918 0 1 1 14.777-3.96c0 4.374-3.167 7.127-6.334 7.127-2.959 0-4.075-2.073-4.21-2.346m0 0 1.57-7.42m-1.57 7.42L8.042 21.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconPinterestStroke
