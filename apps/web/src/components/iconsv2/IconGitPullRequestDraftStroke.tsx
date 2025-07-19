// stroke/development
import type { Component, JSX } from "solid-js"

export const IconGitPullRequestDraftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 0v-2m-5-7q.514 0 1 .1M17 8q.348.462.584 1"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitPullRequestDraftStroke
