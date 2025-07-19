// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconGridDashboardCircleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 17.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14 17.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGridDashboardCircleStroke
