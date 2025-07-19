// icons/svgs/stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartMinimumStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m5 14h.01M11 17h.01M17 17h.01M20 17h.01m-6.02 0H14M7 5c.827 5.183 3.648 9 7 9s6.172-3.817 7-9"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartMinimumStroke
