// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconGitBranchPlusDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 21v-3m0 0v-3m0 3h-3m3 0h3M6 15.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm15-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitBranchPlusDuoStroke
