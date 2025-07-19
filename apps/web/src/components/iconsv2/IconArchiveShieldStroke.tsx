// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveShieldStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 8h16M4 8v9a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8M4 8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m9.736 11.927 1.875-.677c.23-.083.48-.083.71 0l1.902.687c.386.14.655.492.687.902l.079 1.027a3.83 3.83 0 0 1-1.994 3.66l-.52.28a1.04 1.04 0 0 1-1.013-.01l-.53-.302a3.83 3.83 0 0 1-1.93-3.473l.045-1.152c.016-.425.289-.798.689-.942Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArchiveShieldStroke
