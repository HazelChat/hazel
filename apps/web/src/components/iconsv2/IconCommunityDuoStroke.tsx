// duo-stroke/users
import type { Component, JSX } from "solid-js"

export const IconCommunityDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.656 10.618A5.7 5.7 0 0 1 7.328 8.19c1.932 0 3.639.959 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426c1.93 0 3.638.959 4.672 2.426M2.656 21a5.7 5.7 0 0 1 4.672-2.426c1.932 0 3.639.958 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426c1.93 0 3.638.958 4.672 2.426"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.732 5.596a2.596 2.596 0 1 1 5.192 0 2.596 2.596 0 0 1-5.192 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.077 5.596a2.596 2.596 0 1 1 5.19 0 2.596 2.596 0 0 1-5.19 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.732 15.978a2.596 2.596 0 1 1 5.192 0 2.596 2.596 0 0 1-5.192 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.077 15.978a2.596 2.596 0 1 1 5.19 0 2.596 2.596 0 0 1-5.19 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCommunityDuoStroke
