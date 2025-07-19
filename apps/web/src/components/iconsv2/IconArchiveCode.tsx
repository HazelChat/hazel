// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveCode: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm1 7a1 1 0 0 0-1 1v7a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-7a1 1 0 0 0-1-1zm7.095 3.627a1 1 0 0 1-.222 1.396c-.6.437-1.151.932-1.644 1.477a10.7 10.7 0 0 0 1.645 1.477 1 1 0 0 1-1.176 1.618 12.6 12.6 0 0 1-2.417-2.298 1.27 1.27 0 0 1 0-1.594 12.6 12.6 0 0 1 2.417-2.298 1 1 0 0 1 1.397.222Zm3.207-.222a1.001 1.001 0 1 0-1.175 1.618c.6.437 1.151.932 1.644 1.477a10.7 10.7 0 0 1-1.645 1.477 1 1 0 0 0 1.176 1.618 12.6 12.6 0 0 0 2.416-2.298 1.27 1.27 0 0 0 0-1.594 12.6 12.6 0 0 0-2.416-2.298Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArchiveCode
