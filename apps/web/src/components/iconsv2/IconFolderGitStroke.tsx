// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFolderGitStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22 13.338V12.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C18.96 6 17.84 6 15.6 6h-2.316c-.47 0-.704 0-.917-.065a1.5 1.5 0 0 1-.517-.276c-.172-.142-.302-.337-.562-.728l-.575-.862c-.261-.391-.391-.586-.563-.728a1.5 1.5 0 0 0-.517-.276C9.42 3 9.185 3 8.716 3H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 6.04 2 7.16 2 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 21 6.16 21 8.4 21H9m4-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0c0 2.8 2.2 5 5 5m-5-5v8m5-3a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFolderGitStroke
