// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconToggleOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 5h6a7 7 0 1 1 0 14H9A7 7 0 1 1 9 5Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconToggleOffDuoStroke
