// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyBottomLeft02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.93 16.243v2.828h2.827L9.88 16.95v-1.622a.5.5 0 0 1 .5-.5H12l2.452-2.452a4.5 4.5 0 1 0-2.828-2.828z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17.304 8.11 15.89 6.696a1.25 1.25 0 0 1 1.414 1.414Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyBottomLeft02Stroke
