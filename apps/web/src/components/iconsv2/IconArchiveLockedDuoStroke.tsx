// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconArchiveLockedDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.92 14.05c-.208-.04-.49-.04-.982-.04h-1.877c-.49 0-.773 0-.98.04m3.84 0c.64.129 1.12.73 1.155 1.374.03.529-.167 1.283-.407 1.76a1.5 1.5 0 0 1-1.01.79c-.164.036-.349.036-.72.036H11.06c-.37 0-.556 0-.719-.037a1.5 1.5 0 0 1-1.01-.79c-.24-.476-.439-1.23-.408-1.76.037-.641.515-1.244 1.156-1.372m3.84 0c-.05-.616-.03-1.29-.176-1.894a1.5 1.5 0 0 0-1.227-1.13c-.323-.05-.71-.05-1.034 0a1.5 1.5 0 0 0-1.227 1.13c-.147.604-.125 1.278-.176 1.894"
				fill="none"
			/>
		</svg>
	)
}

export default IconArchiveLockedDuoStroke
