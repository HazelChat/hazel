// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconGitlab: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.3 2.603c-.504-1.474-2.575-1.47-3.073.006L1.835 9.697c-.84 2.49-.067 5.254 1.952 6.922l6.27 5.179a3.05 3.05 0 0 0 3.887.005l6.257-5.14c2.025-1.665 2.805-4.432 1.966-6.927l-2.395-7.122c-.496-1.477-2.57-1.483-3.073-.008l-1.763 5.157c-.01.03-.03.034-.036.034H9.1c-.006 0-.026-.004-.036-.034z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGitlab
