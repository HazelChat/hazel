// contrast/building
import type { Component, JSX } from "solid-js"

export const IconOfficeDesk1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M21 15.8V5h-8v10.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C14.52 19 15.08 19 16.2 19h1.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 17.48 21 16.92 21 15.8Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 5v10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 19 18.92 19 17.8 19h-1.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C13 17.48 13 16.92 13 15.8V9m8-4h-8m8 0h1M3 5h10M3 5H2m1 0v4m10-4v4M3 19V9m0 0h10"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 9h2"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 13h2"
			/>
		</svg>
	)
}

export default IconOfficeDesk1
