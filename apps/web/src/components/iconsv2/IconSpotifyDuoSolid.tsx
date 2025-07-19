// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSpotifyDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.05 15.876a10 10 0 0 0-4.1-.876 10 10 0 0 0-2.95.443m8.246-2.32A12.95 12.95 0 0 0 10.951 12c-1.195 0-2.352.161-3.451.463m10-2.066A15.9 15.9 0 0 0 10.951 9C9.588 9 8.264 9.17 7 9.492"
			/>
		</svg>
	)
}

export default IconSpotifyDuoSolid
