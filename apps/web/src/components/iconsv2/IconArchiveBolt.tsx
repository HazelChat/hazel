// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveBolt: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm9.8 2.6a1 1 0 1 0-1.6-1.2l-2.251 3.002c-.812 1.082.112 2.602 1.446 2.38l2.308-.385L11.2 18.4a1 1 0 1 0 1.6 1.2l2.251-3.002c.812-1.082-.111-2.602-1.446-2.38l-2.308.385z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArchiveBolt
