// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSpotifyStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.05 15.876a10 10 0 0 0-4.1-.876 10 10 0 0 0-2.95.443m8.245-2.32A12.95 12.95 0 0 0 10.952 12c-1.195 0-2.353.161-3.452.463m10-2.066A15.9 15.9 0 0 0 10.951 9c-1.363 0-2.687.17-3.95.492m5 11.658a9.15 9.15 0 1 1 0-18.3 9.15 9.15 0 0 1 0 18.3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSpotifyStroke
