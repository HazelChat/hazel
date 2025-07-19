// icons/svgs/contrast/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFile02Star1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m9 8v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Zm-8 1c-.004.1-.005.151-.008.195a3 3 0 0 1-2.797 2.797L9 14c.1.004.151.005.195.008a3 3 0 0 1 2.797 2.797L12 17c.004-.1.005-.151.008-.195a3 3 0 0 1 2.797-2.797L15 14c-.1-.004-.151-.005-.195-.008a3 3 0 0 1-2.797-2.797z"
			/>
		</svg>
	)
}

export default IconFile02Star1
