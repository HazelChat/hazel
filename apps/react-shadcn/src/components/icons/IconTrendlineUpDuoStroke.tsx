// icons/svgs/duo-stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconTrendlineUpDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m2 16.852.73-.937a21.8 21.8 0 0 1 6.61-5.664.696.696 0 0 1 .916.222l3.212 4.818a.64.64 0 0 0 .926.15 20.05 20.05 0 0 0 5.944-7.53l.321-.707"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 11.826a17.3 17.3 0 0 0-1.123-4.38.476.476 0 0 0-.51-.294 17.3 17.3 0 0 0-4.353 1.217"
				fill="none"
			/>
		</svg>
	)
}

export default IconTrendlineUpDuoStroke
