// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUploadUpDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 15a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 6.812a15 15 0 0 1 2.556-2.655A.7.7 0 0 1 12 4m3 2.812a15 15 0 0 0-2.556-2.655A.7.7 0 0 0 12 4m0 0v11"
				fill="none"
			/>
		</svg>
	)
}

export default IconUploadUpDuoStroke
