// duo-solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveArrowDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				fill-rule="evenodd"
				d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M4 9a1 1 0 0 0-1 1v7a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-7a1 1 0 0 0-1-1z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.429 16.09c.634.846 1.37 1.61 2.19 2.275.112.09.246.135.381.135m0 0a.6.6 0 0 0 .381-.135 13 13 0 0 0 2.19-2.275M12 18.5v-6"
			/>
		</svg>
	)
}

export default IconArchiveArrowDownDuoSolid
