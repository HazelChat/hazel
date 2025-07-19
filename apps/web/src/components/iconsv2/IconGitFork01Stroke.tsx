// stroke/development
import type { Component, JSX } from "solid-js"

export const IconGitFork01Stroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 15.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 0V12m0 0h-1.2c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311c-.23-.45-.298-.997-.318-1.862M12 12h1.2c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.23-.45.298-.997.318-1.862M6.01 8.5a3 3 0 1 0-.01 0zm11.982 0a3 3 0 1 1 .009 0z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitFork01Stroke
