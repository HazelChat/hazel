// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveHeartDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 8h16v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 17.563c.35 0 3.5-1.702 3.5-4.084 0-1.19-1.05-2.026-2.1-2.041-.525-.008-1.05.17-1.4.68-.35-.51-.884-.68-1.4-.68-1.05 0-2.1.85-2.1 2.04 0 2.383 3.15 4.085 3.5 4.085Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArchiveHeartDuoStroke
