// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconTextQuotesOpenDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14 13.999a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 13.999a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14 13.999A9.4 9.4 0 0 1 18 6.3M4 14a9.4 9.4 0 0 1 4-7.7"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconTextQuotesOpenDuoStroke
