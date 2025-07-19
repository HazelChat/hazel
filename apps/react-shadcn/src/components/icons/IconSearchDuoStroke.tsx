// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSearchDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.95 14.95 21 21"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 10a6.98 6.98 0 0 1-2.05 4.95A7 7 0 1 1 17 10Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSearchDuoStroke
