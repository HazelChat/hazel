// duo-solid/navigation
import type { Component, JSX } from "solid-js"

export const IconEarthGlobeTimezoneDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.919 3.052A9.15 9.15 0 0 1 21.149 12c0 .861-.118 1.694-.34 2.484M3.461 8.702a9.15 9.15 0 0 0 11.022 12.106"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M2.53 8.342a10.15 10.15 0 0 1 11.598-6.268 1 1 0 0 1 .777.808Q14.999 3.43 15 4c0 2.589-1.496 4.81-3.666 6.018a4.15 4.15 0 0 1-.335 2.166 2.742 2.742 0 1 1-4.908 2.262 4.12 4.12 0 0 1-2.893-4.71 8 8 0 0 1-.327-.227 1 1 0 0 1-.342-1.167Z"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M18 12.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm1 3.9a1 1 0 1 0-2 0v2.1a1 1 0 0 0 1 1h1.6a1 1 0 1 0 0-2H19z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconEarthGlobeTimezoneDuoSolid
