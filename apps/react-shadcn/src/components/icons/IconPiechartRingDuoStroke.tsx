// icons/svgs/duo-stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconPiechartRingDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 0 1 15.848-6.234l-4.357 4.358A3 3 0 0 0 9 12m-6.15 0A9.15 9.15 0 0 0 12 21.15V15a3 3 0 0 1-3-3m-6.15 0H9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21.15a9.15 9.15 0 0 0 6.698-15.384l-4.357 4.358A3 3 0 0 1 12 15z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPiechartRingDuoStroke
