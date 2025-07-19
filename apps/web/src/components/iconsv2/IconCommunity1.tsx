// contrast/users
import type { Component, JSX } from "solid-js"

export const IconCommunity1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M4.732 5.596a2.596 2.596 0 1 1 5.192 0 2.596 2.596 0 0 1-5.192 0Z"
				/>
				<path
					fill="currentColor"
					d="M14.077 5.596a2.596 2.596 0 1 1 5.19 0 2.596 2.596 0 0 1-5.19 0Z"
				/>
				<path
					fill="currentColor"
					d="M4.732 15.978a2.596 2.596 0 1 1 5.192 0 2.596 2.596 0 0 1-5.192 0Z"
				/>
				<path
					fill="currentColor"
					d="M14.077 15.978a2.596 2.596 0 1 1 5.19 0 2.596 2.596 0 0 1-5.19 0Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.328 8.191a2.596 2.596 0 1 1 0-5.191 2.596 2.596 0 0 1 0 5.191Zm0 0c1.932 0 3.639.959 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426m-9.345 0a5.7 5.7 0 0 0-4.672 2.426m14.017-2.426a2.596 2.596 0 1 1 0-5.191 2.596 2.596 0 0 1 0 5.191Zm0 0c1.93 0 3.638.959 4.672 2.426M7.328 18.575a2.596 2.596 0 1 1 0-5.192 2.596 2.596 0 0 1 0 5.192Zm0 0c1.932 0 3.639.958 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426m-9.345 0A5.7 5.7 0 0 0 2.656 21m14.017-2.426a2.596 2.596 0 1 1 0-5.192 2.596 2.596 0 0 1 0 5.192Zm0 0c1.93 0 3.638.958 4.672 2.426"
			/>
		</svg>
	)
}

export default IconCommunity1
