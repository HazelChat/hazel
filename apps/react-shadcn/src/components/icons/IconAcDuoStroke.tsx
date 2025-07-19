// icons/svgs/duo-stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAcDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 8H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 12h-2"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcDuoStroke
