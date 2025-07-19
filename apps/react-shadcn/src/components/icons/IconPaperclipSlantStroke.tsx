// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconPaperclipSlantStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m19.475 12.781-3.56 6.166a6.103 6.103 0 1 1-10.571-6.103l5.086-8.809a4.069 4.069 0 1 1 7.047 4.069l-5.086 8.809a2.034 2.034 0 0 1-3.524-2.034l4.578-7.929"
				fill="none"
			/>
		</svg>
	)
}

export default IconPaperclipSlantStroke
