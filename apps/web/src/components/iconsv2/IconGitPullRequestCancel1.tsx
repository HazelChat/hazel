// contrast/development
import type { Component, JSX } from "solid-js"

export const IconGitPullRequestCancel1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 6v-2m0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-2.5-6.7 2.4-2.4m0 0 2.4-2.4m-2.4 2.4-2.4-2.4m2.4 2.4 2.4 2.4"
			/>
		</svg>
	)
}

export default IconGitPullRequestCancel1
