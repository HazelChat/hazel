// contrast/development
import type { Component, JSX } from "solid-js"

export const IconGitFork011: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path fill="currentColor" d="M9 5.5a3 3 0 0 1-2.991 3H6a3 3 0 1 1 3-3Z" />
				<path fill="currentColor" d="M15 18.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				<path fill="currentColor" d="M15 5.5a3 3 0 0 0 2.991 3H18a3 3 0 1 0-3-3Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 15.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 0V12m0 0h-1.2c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311c-.23-.45-.298-.997-.318-1.862M12 12h1.2c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.23-.45.298-.997.318-1.862M6.01 8.5a3 3 0 1 0-.01 0zm11.982 0a3 3 0 1 1 .009 0z"
			/>
		</svg>
	)
}

export default IconGitFork011
