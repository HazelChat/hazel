// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconHeadphonesDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3.024 15.669a9.5 9.5 0 0 1-.536-3.157 9.512 9.512 0 0 1 19.024 0 9.5 9.5 0 0 1-.526 3.128"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M8.54 14.032a3.378 3.378 0 0 0-6.495 1.863l1.05 3.657a3.378 3.378 0 1 0 6.493-1.862z"
			/>
			<path
				fill="currentColor"
				d="M19.638 11.716a3.38 3.38 0 0 0-4.178 2.316l-1.05 3.658a3.378 3.378 0 0 0 6.494 1.862l1.05-3.657a3.38 3.38 0 0 0-2.317-4.179Z"
			/>
		</svg>
	)
}

export default IconHeadphonesDuoSolid
