// icons/svgs/stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartWaterfallStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m5 14v-3m4-1v-3m4-1V6m4 11V3"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartWaterfallStroke
