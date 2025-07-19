// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconTroubleshootDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.364 5.637 14.12 9.879m0 4.243 4.243 4.243m-8.486-4.243-4.242 4.243m0-12.728 4.242 4.242"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 12a8.97 8.97 0 0 1-2.636 6.364A8.97 8.97 0 0 1 12 21a8.97 8.97 0 0 1-6.364-2.636A8.97 8.97 0 0 1 3 12a8.97 8.97 0 0 1 2.636-6.364A8.97 8.97 0 0 1 12 3a8.97 8.97 0 0 1 6.364 2.636A8.97 8.97 0 0 1 21 12Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 0 1-.879 2.121A3 3 0 0 1 12 15a3 3 0 0 1-2.121-.879A3 3 0 0 1 9 12c0-.828.336-1.578.879-2.121A3 3 0 0 1 12 9a3 3 0 0 1 2.121.879A3 3 0 0 1 15 12Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTroubleshootDuoStroke
