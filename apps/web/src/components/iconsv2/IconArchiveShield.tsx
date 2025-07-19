// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveShield: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm8.951 3.19a.04.04 0 0 1 .03 0l1.902.687a.05.05 0 0 1 .03.038l.079 1.027a2.83 2.83 0 0 1-1.474 2.705l-.518.28a.04.04 0 0 1-.043 0l-.53-.302a2.83 2.83 0 0 1-1.425-2.566l.044-1.152a.05.05 0 0 1 .03-.04zm.71-1.881a2.05 2.05 0 0 0-1.39 0l-1.875.677a2.04 2.04 0 0 0-1.348 1.844l-.044 1.152a4.83 4.83 0 0 0 2.433 4.38l.53.303c.613.35 1.364.358 1.986.021l.518-.28a4.83 4.83 0 0 0 2.515-4.617l-.08-1.027a2.05 2.05 0 0 0-1.343-1.766z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArchiveShield
