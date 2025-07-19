// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFile02SettingsStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.344 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h3m0 0h1a8 8 0 0 1 8 8v.5h-.041A3 3 0 0 0 17 8h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3Zm7 16h.01M18 14l1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02SettingsStroke
