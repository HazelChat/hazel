// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListPlusDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 18v-3m0 0v-3m0 3h-3m3 0h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconListPlusDuoStroke
