// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadingH3DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h8m-8 6V6m8 12V6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18.732 14H18m.732 0a2 2 0 1 0 0-4h-1A2 2 0 0 0 16 11m2.732 3a2 2 0 1 1 0 4h-1A2 2 0 0 1 16 17"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH3DuoStroke
