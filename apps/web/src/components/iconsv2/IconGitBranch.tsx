// solid/development
import type { Component, JSX } from "solid-js"

export const IconGitBranch: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.116 4.539A4.002 4.002 0 0 1 22 5.5a4 4 0 0 1-7.862 1.046A8 8 0 0 0 7 14.5v.126A4.002 4.002 0 0 1 6 22.5a4 4 0 0 1-1-7.874V3a1 1 0 0 1 2 0v5.499a10 10 0 0 1 7.116-3.96Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGitBranch
