// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconGitPullRequestCancelDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 9v12m12-6v-2"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m15.5 8.3 2.4-2.4m0 0 2.4-2.4m-2.4 2.4-2.4-2.4m2.4 2.4 2.4 2.4M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm15 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitPullRequestCancelDuoStroke
