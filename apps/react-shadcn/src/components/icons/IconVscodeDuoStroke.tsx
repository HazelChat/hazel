// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconVscodeDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.799 12 17 16v5l-7.789-7.01M11.8 12l-2.587-1.99M11.799 12 17 7.996V3l-7.788 7.01m0 0L4 6 2 7.5 7 12m0 0-5 4.5L4 18l5.211-4.01M7 12l2.211 1.99"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.231 19.385 17 21V3l3.231 1.616c.642.32.963.481 1.198.72a2 2 0 0 1 .462.748C22 6.4 22 6.76 22 7.478v9.044c0 .718 0 1.077-.11 1.394a2 2 0 0 1-.461.747c-.235.24-.556.4-1.198.721Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVscodeDuoStroke
