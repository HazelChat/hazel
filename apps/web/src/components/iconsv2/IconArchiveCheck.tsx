// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveCheck: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm13.013 3.826a1 1 0 0 0-1.128-1.652 16 16 0 0 0-4.173 4.168L9.257 14.89a1.002 1.002 0 0 0-1.645.317 1 1 0 0 0 .232 1.098l2.341 2.338a1 1 0 0 0 1.575-.21 14 14 0 0 1 4.253-4.607Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArchiveCheck
