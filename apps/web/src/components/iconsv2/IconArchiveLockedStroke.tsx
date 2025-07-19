// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveLockedStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.92 14.05c-.208-.04-.49-.04-.982-.04h-1.876c-.491 0-.774 0-.982.04m3.84 0c.641.129 1.12.73 1.156 1.374.03.529-.167 1.283-.407 1.76a1.5 1.5 0 0 1-1.011.79c-.163.036-.348.036-.72.036h-1.876c-.372 0-.557 0-.72-.037a1.5 1.5 0 0 1-1.01-.79c-.24-.476-.439-1.23-.408-1.76.037-.641.515-1.244 1.156-1.372m3.84 0c-.051-.616-.03-1.29-.176-1.894a1.5 1.5 0 0 0-1.227-1.13c-.323-.05-.71-.05-1.034 0a1.5 1.5 0 0 0-1.227 1.13c-.147.604-.125 1.278-.176 1.894"
				fill="none"
			/>
		</svg>
	)
}

export default IconArchiveLockedStroke
