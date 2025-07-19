// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyRight02DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11 10h9l2 2-2 2h-3l-1.146-1.146a.5.5 0 0 0-.708 0L14 14h-3"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 10h-.468a4.5 4.5 0 1 0 0 4H11"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.5 13v-2a1.25 1.25 0 0 0 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyRight02DuoStroke
