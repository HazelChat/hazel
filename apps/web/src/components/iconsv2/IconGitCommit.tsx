// solid/development
import type { Component, JSX } from "solid-js"

export const IconGitCommit: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 8a4 4 0 0 0-3.874 3H3a1 1 0 1 0 0 2h5.126a4.002 4.002 0 0 0 7.748 0H21a1 1 0 1 0 0-2h-5.126A4 4 0 0 0 12 8Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGitCommit
