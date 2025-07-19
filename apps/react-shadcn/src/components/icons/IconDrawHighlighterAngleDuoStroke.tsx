// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDrawHighlighterAngleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m17.164 15.907-1.45 1.45a1 1 0 0 1-1.414 0L8.643 11.7a1 1 0 0 1 0-1.414l1.45-1.45m7.07 7.071a2.5 2.5 0 0 0 3.148-.318l2.474-2.475m-5.621 2.793a2.5 2.5 0 0 1-.389-.318l-6.364-6.364a2.5 2.5 0 0 1-.318-.389m0 0a2.5 2.5 0 0 1 .318-3.146l2.475-2.475"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m7.07 12.93-3.484 3.485A2 2 0 0 0 3 17.829V19a1 1 0 0 0 1 1h7.586a1 1 0 0 0 .707-.293l.778-.777"
				fill="none"
			/>
		</svg>
	)
}

export default IconDrawHighlighterAngleDuoStroke
