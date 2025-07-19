// contrast/development
import type { Component, JSX } from "solid-js"

export const IconGitPullRequest1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M21 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
				<path fill="currentColor" d="M9 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 0v-4a5 5 0 0 0-5-5"
			/>
		</svg>
	)
}

export default IconGitPullRequest1
