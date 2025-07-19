// stroke/development
import type { Component, JSX } from "solid-js"

export const IconGitBranchCancelStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 15.5V3m0 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm9-10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm0 0a9 9 0 0 0-9 9m10 6.8 2.4-2.4m0 0 2.4-2.4m-2.4 2.4L16 16.5m2.4 2.4 2.4 2.4"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitBranchCancelStroke
