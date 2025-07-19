// stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02ShieldStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m9 8v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Zm-8.389 1.062-1.875.677c-.4.145-.673.517-.689.942l-.044 1.152a3.83 3.83 0 0 0 1.93 3.474l.529.301c.313.18.697.183 1.014.011l.519-.28a3.83 3.83 0 0 0 1.994-3.66l-.08-1.028c-.03-.41-.3-.762-.686-.902l-1.902-.687a1.04 1.04 0 0 0-.71 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02ShieldStroke
