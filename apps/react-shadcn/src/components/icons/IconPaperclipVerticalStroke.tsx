// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconPaperclipVerticalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 9v7a6 6 0 0 1-12 0V6a4 4 0 1 1 8 0v10a2 2 0 1 1-4 0V7"
				fill="none"
			/>
		</svg>
	)
}

export default IconPaperclipVerticalStroke
