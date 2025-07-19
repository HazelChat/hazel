// icons/svgs/duo-stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartSankeyDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.5 3v2m0 5V6m18-3v7m-18-5v1m0-1h18m-18 1h18"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.5 17v2m0 2v-2M2.5 8h1.615c3.252 0 6.177 2.98 7.385 6a7.95 7.95 0 0 0 7.385 5H20.5"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartSankeyDuoStroke
