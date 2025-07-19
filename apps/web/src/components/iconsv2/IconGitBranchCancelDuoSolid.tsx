// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconGitBranchCancelDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9"
				opacity=".28"
			/>
			<path fill="currentColor" d="M14 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
			<path fill="currentColor" d="M2 18.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
			<path
				fill="currentColor"
				d="M16.707 15.793a1 1 0 0 0-1.414 1.414l1.693 1.693-1.693 1.693a1 1 0 0 0 1.414 1.414l1.693-1.693 1.693 1.693a1 1 0 0 0 1.414-1.414L19.814 18.9l1.693-1.693a1 1 0 0 0-1.414-1.414L18.4 17.486z"
			/>
		</svg>
	)
}

export default IconGitBranchCancelDuoSolid
