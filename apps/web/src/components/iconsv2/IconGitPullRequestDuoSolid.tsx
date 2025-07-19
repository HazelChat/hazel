// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconGitPullRequestDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 9v12m12-6v-4a5 5 0 0 0-5-5"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
			<path fill="currentColor" d="M18 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
		</svg>
	)
}

export default IconGitPullRequestDuoSolid
