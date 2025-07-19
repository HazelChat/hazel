// icons/svgs/stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartMedianStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m4 4 .223-.276c1.391-1.722 4.104-1.397 5.048.606l3.458 7.34c.944 2.002 3.657 2.329 5.048.606L21 15m-7-1v.01M14 17v.01M14 5v.01M14 8v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartMedianStroke
