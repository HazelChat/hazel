// stroke/development
import type { Component, JSX } from "solid-js"

export const IconGitPullRequestCancelStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 0v-2m-2.5-4.7 2.4-2.4m0 0 2.4-2.4m-2.4 2.4-2.4-2.4m2.4 2.4 2.4 2.4"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitPullRequestCancelStroke
