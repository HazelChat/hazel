// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFolderOpenDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.961 9.997c-.047-.783-.155-1.339-.397-1.813a4 4 0 0 0-1.748-1.748C17.96 6 16.84 6 14.6 6h-1.316c-.47 0-.704 0-.917-.065a1.5 1.5 0 0 1-.517-.276c-.172-.142-.302-.337-.562-.728l-.575-.862c-.261-.391-.391-.586-.563-.728a1.5 1.5 0 0 0-.517-.276C9.42 3 9.185 3 8.716 3H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 6.04 2 7.16 2 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748q.224.114.477.19"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.357 12.34c.23-.845.345-1.267.588-1.582a2 2 0 0 1 .82-.626c.366-.152.804-.152 1.68-.152h11.414c.455 0 .813 0 1.102.018.39.023.654.077.86.204.317.195.55.5.655.857.12.406-.021.922-.301 1.952l-.89 3.27c-.46 1.69-.69 2.536-1.175 3.163a4 4 0 0 1-1.64 1.254c-.734.302-1.61.302-3.361.302H7.187c-1.337 0-2.047 0-2.527-.245a2 2 0 0 1-.963-1.192c-.159-.542.028-1.23.402-2.603z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFolderOpenDuoStroke
