// icons/svgs/duo-stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconMathDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 11V7m0 0V3m0 4h-4m4 0h4M3 21l3-3m0 0 3-3m-3 3-3-3m3 3 3 3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 7h6m5 9h7m-7 4h7"
				fill="none"
			/>
		</svg>
	)
}

export default IconMathDuoStroke
