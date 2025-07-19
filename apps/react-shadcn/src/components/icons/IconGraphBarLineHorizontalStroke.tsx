// icons/svgs/stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphBarLineHorizontalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7 7h4m-4 5h11M7 17h8"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphBarLineHorizontalStroke
