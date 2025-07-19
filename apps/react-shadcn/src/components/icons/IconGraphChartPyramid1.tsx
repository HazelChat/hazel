// icons/svgs/contrast/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartPyramid1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M10.685 4.811a1.478 1.478 0 0 1 2.63 0L20.8 18.635c.573 1.06-.155 2.373-1.315 2.373H4.515c-1.16 0-1.888-1.314-1.315-2.373z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m19.373 16.069 1.427 2.635c.573 1.059-.155 2.373-1.315 2.373H4.515c-1.16 0-1.888-1.314-1.315-2.373l1.427-2.635m14.746 0H4.627m14.746 0-2.707-5m-12.04 5 2.708-5m9.332 0-3.35-6.19a1.478 1.478 0 0 0-2.631 0l-3.351 6.19m9.332 0H7.334"
			/>
		</svg>
	)
}

export default IconGraphChartPyramid1
