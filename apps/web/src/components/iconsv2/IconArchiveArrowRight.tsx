// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveArrowRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm6 4.5a1 1 0 0 0 0 2h3.916q-.443.409-.926.771a1 1 0 1 0 1.2 1.6 14 14 0 0 0 2.452-2.361 1.6 1.6 0 0 0 0-2.02 14 14 0 0 0-2.452-2.361 1 1 0 0 0-1.2 1.6q.483.362.926.771z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArchiveArrowRight
