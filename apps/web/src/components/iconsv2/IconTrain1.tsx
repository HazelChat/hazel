// contrast/automotive
import type { Component, JSX } from "solid-js"

export const IconTrain1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.2 19h9.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C20 17.48 20 16.92 20 15.8V13H4v2.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C5.52 19 6.08 19 7.2 19Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 3 8.16 3 10.4 3h3.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C20 6.04 20 7.16 20 9.4v6.4c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 19 17.92 19 16.8 19H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 17.48 4 16.92 4 15.8z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 13h16"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 16h1"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 16h1"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8 19-2 3"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m16 19 2 3"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v10"
			/>
		</svg>
	)
}

export default IconTrain1
