// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListCheckDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m13.5 14.978 2.341 2.339A15 15 0 0 1 20.4 12.38"
				fill="none"
			/>
		</svg>
	)
}

export default IconListCheckDuoStroke
