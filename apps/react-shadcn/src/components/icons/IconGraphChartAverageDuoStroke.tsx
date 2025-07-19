// icons/svgs/duo-stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartAverageDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m7 7 .223-.276c1.391-1.722 4.104-1.396 5.048.606l3.458 7.34c.944 2.003 3.657 2.329 5.048.606L21 15M6 11h.01M10 11h.01M18 11h.01M22 11h.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartAverageDuoStroke
