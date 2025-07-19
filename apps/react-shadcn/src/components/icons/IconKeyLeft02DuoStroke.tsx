// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyLeft02DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.001 10h-9l-2 2 2 2h3l1.146-1.146a.5.5 0 0 1 .708 0L10.001 14h3"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13 10h.469a4.5 4.5 0 1 1 0 4H13"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18.501 13v-2a1.25 1.25 0 0 1 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyLeft02DuoStroke
