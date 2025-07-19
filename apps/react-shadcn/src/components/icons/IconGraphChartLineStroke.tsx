// icons/svgs/stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGraphChartLineStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m7 17 1.992-4.97m10.433-4.114A2 2 0 0 0 22 6a2 2 0 1 0-2.575 1.916Zm0 0-1.85 5.207m0 0a2 2 0 0 0-2.093.615m2.093-.615a2.001 2.001 0 1 1-2.093.615m0 0-3.963-2.135m0 0a2 2 0 1 0-2.526.426m2.525-.426a1.995 1.995 0 0 1-2.526.426"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartLineStroke
