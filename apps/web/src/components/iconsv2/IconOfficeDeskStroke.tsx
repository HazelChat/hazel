// stroke/building
import type { Component, JSX } from "solid-js"

export const IconOfficeDeskStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 5v10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 19 18.92 19 17.8 19h-1.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C13 17.48 13 16.92 13 15.8V9m8-4h-8m8 0h1M3 5h10M3 5H2m1 0v4m10-4v4M3 19V9m0 0h10"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 9h2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 13h2"
				fill="none"
			/>
		</svg>
	)
}

export default IconOfficeDeskStroke
